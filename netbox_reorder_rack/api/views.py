import decimal
from collections import namedtuple

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

# A device's requested destination: position and face as they should end up, with
# position None meaning unmounted.
Move = namedtuple("Move", ("device", "position", "face"))


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

        # Validate input using serializer
        serializer = ReorderRackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                moves = self._collect_moves(request, rack, serializer.validated_data)

                # If no changes were made, return 304 or a custom response
                if not moves:
                    return Response(
                        {"message": "No changes detected."},
                        status=status.HTTP_304_NOT_MODIFIED,
                    )

                self._apply_moves(moves)

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

    def _collect_moves(self, request, rack, data):
        """
        Work out which devices actually move, without writing anything yet.

        Devices whose position and face are unchanged are left out, so they are neither
        saved nor recorded in the change log. A device listed in more than one category
        is taken from the first one it appears in: being mounted on a face takes
        precedence over being listed as unracked.
        """
        permission = get_permission_for_model(Device, "change")
        moves = []
        seen = set()

        for category in ("front", "rear", "other"):
            for device_data in data[category]:
                if device_data["id"] in seen:
                    continue

                device = rack.devices.filter(pk=device_data["id"]).first()
                if device is None:
                    # Not in this rack, so not ours to move.
                    continue

                # 404 for a device the user is not permitted to see at all.
                get_object_or_404(
                    Device.objects.restrict(request.user), pk=device_data["id"]
                )

                if category == "other":
                    if device.position == device_data["y"]:
                        continue
                    position, face = None, ""
                else:
                    position = decimal.Decimal(device_data["y"])
                    face = device_data["face"]
                    if device.position == position and device.face == face:
                        continue

                self._check_permission(request, device, permission)
                seen.add(device_data["id"])
                moves.append(Move(device, position, face))

        return moves

    def _apply_moves(self, moves):
        """
        Write the new layout, vacating every unit before filling any of them.

        A device moving into a unit that another device in the same request is leaving
        would fail validation if the devices were saved one after another, because the
        unit is still occupied at the point it is checked. Ordering the saves cannot fix
        this in general: two devices exchanging places have no valid order. So every
        moving device is unmounted first, in bulk.

        That bulk update deliberately bypasses save(), which keeps the intermediate,
        half-empty rack out of the change log; each device is then saved once, with its
        final position, and validated as usual.
        """
        Device.objects.filter(pk__in=[move.device.pk for move in moves]).update(
            position=None, face=""
        )

        for move in moves:
            device = move.device
            device.position = move.position
            device.face = move.face
            device.clean()
            device.save()

    def _check_permission(self, request, device, permission):
        """Helper method to check if the user has permission for the device."""
        if not request.user.has_perm(permission, obj=device):
            raise PermissionDenied(
                _(f"You do not have permissions to edit {get_device_name(device)}.")
            )
