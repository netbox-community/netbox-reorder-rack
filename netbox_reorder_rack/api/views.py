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


class ReorderRackSerializer(serializers.Serializer):
    rack_id = serializers.IntegerField()
    front = serializers.ListField(child=serializers.JSONField())
    rear = serializers.ListField(child=serializers.JSONField())
    other = serializers.ListField(child=serializers.JSONField())


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
            changes_made = False  # Flag to track if any changes were made

            with transaction.atomic():
                # Update devices in different categories
                changes_made |= self._update_device_positions(
                    request,
                    rack,
                    serializer.validated_data["front"],
                    permission,
                    "front",
                )
                changes_made |= self._update_device_positions(
                    request, rack, serializer.validated_data["rear"], permission, "rear"
                )
                changes_made |= self._update_device_positions(
                    request,
                    rack,
                    serializer.validated_data["other"],
                    permission,
                )

                # If no changes were made, return 304 or a custom response
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

    def _get_target_location(self, device_data, face):
        """Get target position and face for a device."""
        if face is None:
            return None, ""
        return decimal.Decimal(device_data["y"]), device_data["face"]

    def _has_conflict(self, target_pos, target_face, occupied_positions):
        """Check if target location conflicts with occupied positions."""
        if target_pos is None:
            return False
        return (target_pos, target_face) in occupied_positions

    def _move_device(self, device, position, face, request, permission):
        """Move a device to a new position and face."""
        if device.position == position and device.face == face:
            return False

        if not request.user.has_perm(permission, obj=device):
            raise PermissionDenied(
                _(f"You do not have permissions to edit {get_device_name(device)}.")
            )

        device.position = position
        device.face = face if face else ""
        device.clean()
        device.save()
        return True

    def _update_device_positions(
        self, request, rack, device_data_list, permission, face=None
    ):
        """Update device positions with conflict resolution."""
        if not device_data_list:
            return False

        changes_made = False    # Local flag to track if changes are made
        pending = []

        # Build pending moves list
        for device_data in device_data_list:
            device = rack.devices.filter(pk=device_data["id"]).first()
            if not device:
                continue

            target_pos, target_face = self._get_target_location(device_data, face)
            current_pos = device.position
            current_face = device.face if device.face else ""

            if current_pos != target_pos or current_face != target_face:
                pending.append(
                    {
                        "device": device,
                        "target_pos": target_pos,
                        "target_face": target_face,
                    }
                )

        # Track currently occupied positions
        occupied = {
            (m["device"].position, m["device"].face if m["device"].face else ""): m[
                "device"
            ]
            for m in pending
            if m["device"].position is not None
        }

        # Process moves until none remain
        max_iterations = len(pending) * 2
        iteration = 0

        while pending and iteration < max_iterations:
            iteration += 1
            moved = []

            for move in pending:
                device = move["device"]
                target_pos = move["target_pos"]
                target_face = move["target_face"]

                # Check if target is blocked
                if self._has_conflict(target_pos, target_face, occupied):
                    blocker = occupied.get((target_pos, target_face))
                    # Skip if blocker hasn't moved yet
                    if (
                        blocker
                        and blocker.id != device.id
                        and blocker in [m["device"] for m in pending]
                    ):
                        continue

                # Clear current position from occupied
                current_key = (device.position, device.face if device.face else "")
                if current_key in occupied and occupied[current_key].id == device.id:
                    del occupied[current_key]

                # Move device
                if self._move_device(
                    device, target_pos, target_face, request, permission
                ):
                    changes_made = True

                # Update occupied with new position
                if target_pos is not None:
                    occupied[(target_pos, target_face)] = device

                moved.append(move)

            # Remove completed moves
            for move in moved:
                pending.remove(move)

            # Break circular dependencies by temporarily unracking
            if not moved and pending:
                victim = pending[0]
                device = victim["device"]
                current_key = (device.position, device.face if device.face else "")
                if current_key in occupied:
                    del occupied[current_key]

                if self._move_device(device, None, "", request, permission):
                    changes_made = True

        return changes_made
