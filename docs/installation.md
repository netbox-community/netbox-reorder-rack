# Installation

This plugin adds no models, so there are no migrations to run. It does ship JavaScript and CSS, so static files must be collected.

!!! note
    Check the [compatibility matrix](https://github.com/netbox-community/netbox-reorder-rack/blob/main/COMPATIBILITY.md) before installing. The plugin declares no `min_version` or `max_version`, so NetBox will not stop you loading it on an unlisted version — but such combinations are untested.

For NetBox Docker, see [Using NetBox Plugins](https://github.com/netbox-community/netbox-docker/wiki/Using-Netbox-Plugins).

## 1. Virtual Environment

The plugin is distributed on [PyPI](https://pypi.org/project/netbox-reorder-rack/). If NetBox was installed following the standard installation instructions, first activate its Python virtual environment (typically located at `/opt/netbox/venv/`):

```shell
source /opt/netbox/venv/bin/activate
```

## 2. Python Package

```shell
pip install netbox-reorder-rack
```

The plugin has no Python dependencies of its own.

## 3. Persist the Installation

Add the package to `local_requirements.txt` in the NetBox root directory (alongside `requirements.txt`), so it is reinstalled automatically on future upgrades:

```shell
echo netbox-reorder-rack >> local_requirements.txt
```

!!! warning
    Skipping this step means the plugin will be missing after the next NetBox upgrade, and NetBox will fail to start because `configuration.py` still references it.

## 4. Enable Plugin

Add `netbox_reorder_rack` to the `PLUGINS` list in `configuration.py`:

```python
PLUGINS = [
    # ...
    "netbox_reorder_rack",
]
```

!!! note
    If there are no plugins already installed, you might need to create this parameter. If so, be sure to define `PLUGINS` as a list _containing_ the plugin name as above, rather than just the name.

There is nothing to add to `PLUGINS_CONFIG` — the plugin has no settings.

## 5. Collect Static Files and Restart

The drag-and-drop interface is JavaScript, so it must be collected before NetBox can serve it:

```shell
python3 manage.py collectstatic --no-input
systemctl restart netbox
```

!!! warning
    Skipping `collectstatic` leaves the reorder page unable to load its JavaScript, so the elevation renders but nothing can be dragged.

A **Reorder** button should now appear on rack detail views, for users with `dcim.change_device`.

## Upgrading

```shell
source /opt/netbox/venv/bin/activate
pip install --upgrade netbox-reorder-rack
python3 manage.py collectstatic --no-input
systemctl restart netbox
```

`collectstatic` matters on every upgrade, not just the first install: the plugin's JavaScript bundle changes between releases, and a stale copy in the static root will keep being served.

## Development

To work on the plugin itself, including rebuilding the JavaScript bundle, see [Development](development.md).
