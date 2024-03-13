from netbox.plugins import PluginTemplateExtension


class ReorderButton(PluginTemplateExtension):
    model = "dcim.rack"

    def buttons(self):
        return self.render("netbox_reorder_rack/inc/rack_button.html")


template_extensions = [ReorderButton]
