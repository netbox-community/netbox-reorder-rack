# Compatibility Matrix

| Release | Minimum NetBox Version | Maximum NetBox Version |
|---------|------------------------|------------------------|
| 1.1.5   | 4.7.0                  | 4.7.x                  |
| 1.1.4   | 4.3.0                  | 4.5.x                  |
| 1.1.3   | 4.0.0                  | 4.2.x                  |
| 1.0.0   | —                      | 4.0.0                  |

This plugin does not set `min_version` or `max_version` in its `PluginConfig`. NetBox does not
block the plugin on an unlisted version. The table shows the NetBox versions used to build and
test each release. A version outside this range is untested, not blocked.

Release 1.1.5 has a hard minimum version. Earlier releases do not. The reorder page uses
NetBox's declarative UI components. It imports `netbox.ui.breadcrumbs`. NetBox 4.7 first adds
this module. On an earlier NetBox release, the plugin fails to import. Use release 1.1.4 with
NetBox 4.3 through 4.6.
