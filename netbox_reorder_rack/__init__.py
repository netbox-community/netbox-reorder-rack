from netbox.plugins import PluginConfig


class NetboxReorderRackConfig(PluginConfig):
    name = "netbox_reorder_rack"
    verbose_name = "NetBox Reorder Rack"
    description = "NetBox plugin to reorder rack layouts."
    version = "1.1.5"
    base_url = "reorder"
    min_version = 4.7.0

config = NetboxReorderRackConfig
