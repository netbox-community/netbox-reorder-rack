from dcim.models import Device
from dcim.models import Rack
from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.mixins import PermissionRequiredMixin
from django.shortcuts import get_object_or_404
from django.shortcuts import render
from django.views.generic import View
from utilities.views import register_model_view


@register_model_view(
    Rack,
    name="reorder",
    path="reorder",
)
class ReorderView(LoginRequiredMixin, PermissionRequiredMixin, View):
    permission_required = ["dcim.change_device", "dcim.view_device"]
    template_name = "netbox_reorder_rack/rack.html"

    def get(self, request, pk):
        rack = get_object_or_404(Rack, pk=pk)
        non_racked = Device.objects.filter(
            rack=rack, position__isnull=True, parent_bay__isnull=True
        )
        return render(
            request,
            self.template_name,
            {
                "object": rack,
                "front_units": rack.get_rack_units(expand_devices=False, face="front"),
                "rear_units": rack.get_rack_units(expand_devices=False, face="rear"),
                "non_racked": non_racked,
                "basepath": settings.BASE_PATH,
            },
        )
