from dcim.models import Device
from dcim.models import DeviceType
from dcim.models import Rack
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from netbox.config import get_config
from netbox.ui import layout
from netbox.ui import panels
from netbox.ui.breadcrumbs import Breadcrumb
from netbox.ui.breadcrumbs import filtered_list_url
from netbox.views import generic
from utilities.views import register_model_view
from utilities.views import ViewTab

# Display modes offered by the view selector, mapping the `view` query parameter to whether
# device-type images and text labels are drawn.
VIEW_MODES = {
    "images-and-labels": {"images": True, "labels": True},
    "images-only": {"images": True, "labels": False},
    "labels-only": {"images": False, "labels": True},
}
DEFAULT_VIEW_MODE = "images-and-labels"


@register_model_view(
    Rack,
    name="reorder",
    path="reorder",
)
class ReorderView(generic.ObjectView):
    """
    A drag-and-drop rack elevation, rendered as a tab on the rack.

    The page chrome — breadcrumbs, title, tab strip — comes from NetBox's declarative UI
    components rather than from hand-written template blocks. Only the elevation itself is a
    template, embedded as a TemplatePanel, which is how NetBox renders its own rack
    elevations.
    """
    queryset = Rack.objects.all()
    template_name = "netbox_reorder_rack/rack.html"

    # The rack's own Clone/Edit/Delete buttons are not meaningful on this page.
    actions = ()

    tab = ViewTab(
        label=_("Reorder"),
        permission="dcim.change_device",
    )

    layout = layout.SimpleLayout(
        breadcrumbs=[
            Breadcrumb("site", url=filtered_list_url("dcim:rack_list", "site_id")),
            Breadcrumb(
                lambda obj: obj.location.get_ancestors() if obj.location else [],
                url=filtered_list_url("dcim:rack_list", "location_id"),
            ),
            Breadcrumb("location", url=filtered_list_url("dcim:rack_list", "location_id")),
        ],
        bottom_panels=[
            panels.TemplatePanel("netbox_reorder_rack/inc/reorder.html"),
        ],
    )

    def has_permission(self):
        """
        This view repositions devices, not the rack, so it requires device permissions.

        NetBox's default implementation would additionally restrict the rack queryset using the
        required permission's action, which would demand rack permissions this view has never
        asked for. The permission contract is therefore stated explicitly here.
        """
        return self.request.user.has_perms(("dcim.view_device", "dcim.change_device"))

    def get_extra_context(self, request, instance):
        # An unrecognised `view` value falls back to the default rather than failing.
        mode = VIEW_MODES.get(request.GET.get("view"), VIEW_MODES[DEFAULT_VIEW_MODE])

        non_racked = Device.objects.filter(
            rack=instance, position__isnull=True, parent_bay__isnull=True
        )

        # Exclude child devices, which are represented by their parent.
        exclude_list = []
        for device in non_racked:
            device_type = DeviceType.objects.get(id=device.device_type.id)
            if device_type.subdevice_role == "child":
                exclude_list.append(device.id)

        non_racked_devices = non_racked.exclude(pk__in=exclude_list)
        config = get_config()

        base_url = f"{request.scheme}://{request.get_host().rstrip('/')}"

        return {
            "images": mode["images"],
            "labels": mode["labels"],
            "unit_width": config.RACK_ELEVATION_DEFAULT_UNIT_WIDTH,
            "base_url": base_url,
            "front_units": instance.get_rack_units(expand_devices=False, face="front"),
            "rear_units": instance.get_rack_units(expand_devices=False, face="rear"),
            "non_racked": non_racked_devices,
            "basepath": settings.BASE_PATH,
        }
