import decimal

from dcim.models import Device
from dcim.models import Rack
from django.contrib.auth.mixins import PermissionRequiredMixin
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework import status
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from utilities.permissions import get_permission_for_model


def get_device_name(device):
    if device.virtual_chassis:
        name = f"{device.virtual_chassis.name}:{device.vc_position}"
    elif device.name:
        name = device.name
    else:
        name = str(device.device_type)

    return name


class DevicePositionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    position = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        allow_null=True,
    )
    face = serializers.ChoiceField(
        choices=["front", "rear"],
        allow_null=True,
    )


class ReorderRackSerializer(serializers.Serializer):
    rack_id = serializers.IntegerField()
    elements = serializers.ListField(child=DevicePositionSerializer())


class SaveViewSet(PermissionRequiredMixin, viewsets.ViewSet):
    permission_required = ["dcim.change_device", "dcim.view_device"]
    serializer_class = ReorderRackSerializer
    queryset = Device.objects.none()
    schema = None

    def update(self, request, pk):
        rack = get_object_or_404(Rack, pk=pk)
        permission = get_permission_for_model(Device, "change")

        # Validate input using serializer
        serializer = ReorderRackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                changes_made = self._update_device_positions(
                    request,
                    rack,
                    serializer.validated_data["elements"],
                    permission,
                )

                if not changes_made:
                    return Response(
                        {"message": "No changes detected."},
                        status=status.HTTP_304_NOT_MODIFIED,
                    )

                return Response(
                    {
                        "message": "Devices reordered successfully",
                        "data": serializer.data,
                    },
                    status=status.HTTP_201_CREATED,
                )
        except PermissionDenied as e:
            return Response(
                {"message": "Permission denied", "error": str(e)},
                status=status.HTTP_403_FORBIDDEN,
            )
        except Exception as e:
            return Response(
                {"message": "Error saving data", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_device_range(self, position, device):
        """Calculate the range of rack units occupied by a device."""
        if position is None:
            return None, None

        u_height = device.device_type.u_height
        start = position
        end = position + decimal.Decimal(u_height)
        return start, end

    def _ranges_overlap(self, start1, end1, start2, end2):
        """Check if two ranges overlap."""
        if start1 is None or start2 is None:
            return False
        # Ranges overlap if: start1 < end2 AND start2 < end1
        return start1 < end2 and start2 < end1

    def _get_occupied_ranges(self, pending_moves):
        """Build a dict mapping (face) -> list of (start, end, device) tuples."""
        occupied = {}

        for move in pending_moves:
            device = move["device"]
            if device.position is None or device.face is None:
                continue

            start, end = self._get_device_range(device.position, device)
            if start is None:
                continue

            face = device.face
            if face not in occupied:
                occupied[face] = []
            occupied[face].append((start, end, device))

        return occupied

    def _check_conflict(
        self, target_pos, target_face, device, occupied_ranges, pending_devices
    ):
        """Check if placing device at target position would conflict with occupied ranges."""
        if target_pos is None or target_face is None:
            return False

        target_start, target_end = self._get_device_range(target_pos, device)
        if target_start is None:
            return False

        # Check against all devices on the same face
        if target_face in occupied_ranges:
            for start, end, occupant in occupied_ranges[target_face]:
                # Skip if it's the same device
                if occupant.id == device.id:
                    continue

                # Check if ranges overlap
                if self._ranges_overlap(target_start, target_end, start, end):
                    # Only block if the occupant hasn't moved yet
                    if occupant in pending_devices:
                        return True

        return False

    def _update_occupied_ranges(
        self, occupied_ranges, old_pos, old_face, new_pos, new_face, device
    ):
        """Update occupied ranges after moving a device."""
        # Remove old position
        if old_pos is not None and old_face is not None:
            old_start, old_end = self._get_device_range(old_pos, device)
            if old_face in occupied_ranges:
                occupied_ranges[old_face] = [
                    (s, e, d)
                    for s, e, d in occupied_ranges[old_face]
                    if d.id != device.id
                ]

        # Add new position
        if new_pos is not None and new_face is not None:
            new_start, new_end = self._get_device_range(new_pos, device)
            if new_face not in occupied_ranges:
                occupied_ranges[new_face] = []
            occupied_ranges[new_face].append((new_start, new_end, device))

    def _move_device(self, device, position, face, request, permission):
        """Move a device to a new position and face."""
        if device.position == position and device.face == face:
            return False

        if not request.user.has_perm(permission, obj=device):
            raise PermissionDenied(
                _(f"You do not have permissions to edit {get_device_name(device)}.")
            )

        device.position = position if face else None
        device.face = face
        device.clean()
        device.save()
        return True

    def _update_device_positions(self, request, rack, elements, permission):
        """Update device positions with conflict resolution."""
        if not elements:
            return False

        changes_made = False
        pending = []

        # Build pending moves list
        for element in elements:
            device = rack.devices.filter(pk=element["id"]).first()
            if not device:
                continue

            target_face = element.get("face")
            if target_face is None:
                target_pos = None
            else:
                target_pos = element.get("position")
                if target_pos is not None:
                    target_pos = decimal.Decimal(str(target_pos))

            if device.position != target_pos or device.face != target_face:
                pending.append(
                    {
                        "device": device,
                        "target_pos": target_pos,
                        "target_face": target_face,
                    }
                )

        # Track currently occupied ranges by face
        occupied_ranges = self._get_occupied_ranges(pending)

        # Process moves until none remain
        max_iterations = len(pending) * 2
        iteration = 0

        while pending and iteration < max_iterations:
            iteration += 1
            moved = []
            pending_devices = [m["device"] for m in pending]

            for move in pending:
                device = move["device"]
                target_pos = move["target_pos"]
                target_face = move["target_face"]

                # Check if target is blocked by a device that hasn't moved yet
                if self._check_conflict(
                    target_pos, target_face, device, occupied_ranges, pending_devices
                ):
                    continue

                # Store old position for cleanup
                old_pos = device.position
                old_face = device.face

                # Move device
                if self._move_device(
                    device, target_pos, target_face, request, permission
                ):
                    changes_made = True

                # Update occupied ranges
                self._update_occupied_ranges(
                    occupied_ranges, old_pos, old_face, target_pos, target_face, device
                )

                moved.append(move)

            # Remove completed moves
            for move in moved:
                pending.remove(move)

            # Break circular dependencies by temporarily unracking
            if not moved and pending:
                victim = pending[0]
                device = victim["device"]
                old_pos = device.position
                old_face = device.face

                if self._move_device(device, None, None, request, permission):
                    changes_made = True

                # Update occupied ranges
                self._update_occupied_ranges(
                    occupied_ranges, old_pos, old_face, None, None, device
                )

        return changes_made
