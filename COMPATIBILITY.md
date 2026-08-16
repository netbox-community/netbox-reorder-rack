# Compatibility Matrix

| Release | Minimum NetBox Version | Maximum NetBox Version |
|---------|------------------------|------------------------|
| 1.1.5   | 4.7.0                  | 4.7.x                  |
| 1.1.4   | 4.3.0                  | 4.5.x                  |
| 1.1.3   | 4.0.0                  | 4.2.x                  |
| 1.0.0   | —                      | 4.0.0                  |

This plugin does not declare `min_version` or `max_version` in its `PluginConfig`, so NetBox
will not refuse to load it on an unlisted version. The matrix records the ranges each release
was built and tested against; running outside them is untested rather than blocked.

The minimum for 1.1.5 is a hard one, unlike the earlier entries. The reorder page is built from
NetBox's declarative UI components and imports `netbox.ui.breadcrumbs`, which arrived in 4.7, so
on an earlier release the plugin fails to import rather than merely behaving oddly. Stay on
1.1.4 for NetBox 4.3 to 4.6.
