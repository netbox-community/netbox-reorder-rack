from extras.plugins import PluginConfig


class NetboxReorderRackConfig(PluginConfig):
    name = "netbox_reorder_rack"
    verbose_name = "NetBox Reorder Rack"
    description = "NetBox plugin to reorder rack layouts."
    version = "1.0.0"
    base_url = "reorder"


config = NetboxReorderRackConfig
