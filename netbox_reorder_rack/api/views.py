import decimal

from dcim.models import Device
from dcim.models import Rack
from django.contrib.auth.mixins import PermissionRequiredMixin
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework import status
from rest_framework import viewsets
from rest_framework.response import Response


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
        try:
            serializer = ReorderRackSerializer(request.data)
            with transaction.atomic():
                for device in rack.devices.all():
                    device.position = None
                    device.clean()
                    device.save()

                for new in request.data["front"]:
                    device = rack.devices.filter(pk=new["id"]).first()
                    device.position = decimal.Decimal(new["y"])
                    device.face = new["face"]
                    device.clean()
                    device.save()

                for new in request.data["rear"]:
                    device = rack.devices.filter(pk=new["id"]).first()
                    device.position = decimal.Decimal(new["y"])
                    device.face = new["face"]
                    device.clean()
                    device.save()

                return Response(
                    {"message": "POST request received", "data": serializer.data},
                    status=status.HTTP_201_CREATED,
                )
        except Exception as e:
            return Response(
                {"message": "Error saving data", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
