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
                    "other",
                    is_other=True,
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

    def _update_device_positions(
        self, request, rack, device_data_list, permission, device_type, is_other=False
    ):
        """Helper method to update device positions based on the category."""
        changes_made = False  # Local flag to track if changes are made

        for device_data in device_data_list:
            device = rack.devices.filter(pk=device_data["id"]).first()
            current_device = get_object_or_404(
                Device.objects.restrict(request.user), pk=device_data["id"]
            )

            # Update position and face for 'front' and 'rear' devices if changed
            if current_device.face != device_data[
                "face"
            ] or device.position != decimal.Decimal(device_data["y"]):
                if is_other:
                    device.position = None  # For 'other' devices
                else:
                    device.position = decimal.Decimal(device_data["y"])
                    device.face = device_data["face"]

                self._check_permission(request, device, permission)

                # Save the device and mark changes as made
                device.clean()
                device.save()
                changes_made = True

        return changes_made  # Return whether changes were made

    def _check_permission(self, request, device, permission):
        """Helper method to check if the user has permission for the device."""
        if not request.user.has_perm(permission, obj=device):
            raise PermissionDenied(
                _(f"You do not have permissions to edit {get_device_name(device)}.")
            )
