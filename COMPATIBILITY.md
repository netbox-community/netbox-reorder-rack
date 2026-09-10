# Compatibility Matrix

| Release | Minimum NetBox Version | Maximum NetBox Version |
|---------|------------------------|------------------------|
| 1.1.5   | 4.7.0                  | 4.7.x                  |
| 1.1.4   | 4.3.0                  | 4.5.x                  |
| 1.1.3   | 4.0.0                  | 4.2.x                  |
| 1.0.0   | —                      | 4.0.0                  |

As of release 1.1.5, this plugin sets `min_version = "4.7.0"` in its `PluginConfig`. NetBox
refuses to load the plugin below that version. It does not set `max_version`, so NetBox does
not block a newer, unlisted version. The table shows the NetBox versions used to build and test
each release.

Release 1.1.5 has a hard minimum version. Earlier releases do not enforce one; the plugin loads
on an unlisted NetBox version, but the table still shows which versions were actually tested.
The reorder page uses NetBox's declarative UI components. It imports
`netbox.ui.breadcrumbs`. NetBox 4.7 first adds this module. On an earlier NetBox release, the
plugin fails to import, so 1.1.5 enforces the minimum in code. Use release 1.1.4 with NetBox
4.3 through 4.6.
