<p align="center"><img src="docs/img/reorder-rack.svg"></p>

<h1 align="center">NetBox Reorder Rack Plugin</h1>

<p align="center">
<img src="https://img.shields.io/pypi/v/netbox-reorder-rack" alt="Version"/>
<img src="https://img.shields.io/pypi/dm/netbox-reorder-rack" alt="Downloads"/>
</p>

This [NetBox](http://netboxlabs.com/oss/netbox/) plugin adds a drag-and-drop rack elevation, so devices can be repositioned by dragging rather than by editing each one and typing a new position.

Front and rear faces are shown side by side with a non-racked devices list, so a device can be moved between positions, between faces, or out of the rack entirely. Nothing is written until you save, and every change is recorded as an ordinary device position — including in NetBox's change log.

![Reorder Rack](docs/img/netbox-reorder-rack.gif)

See the [compatibility matrix](COMPATIBILITY.md) for supported NetBox versions, and the [changelog](CHANGELOG.md) for release notes.

> [!NOTE]
> If you hit a problem, please open an [issue](https://github.com/netbox-community/netbox-reorder-rack/issues), or find us in the [NetDev](https://netdev.chat/) community on Slack.

## Installation

Brief installation instructions are provided below. For a complete installation guide, please refer to the included [documentation](docs/installation.md).

For NetBox Docker, see [Using NetBox Plugins](https://github.com/netbox-community/netbox-docker/wiki/Using-Netbox-Plugins).

1. Install the plugin from [PyPI](https://pypi.org/project/netbox-reorder-rack/):

```shell
source /opt/netbox/venv/bin/activate
pip install netbox-reorder-rack
```

2. Add the package to `local_requirements.txt` so it survives future upgrades:

```shell
echo netbox-reorder-rack >> local_requirements.txt
```

3. Add `netbox_reorder_rack` to `PLUGINS` in `configuration.py`:

```python
PLUGINS = [
    # ...
    "netbox_reorder_rack",
]
```

4. Collect static files and restart NetBox:

```shell
python3 manage.py collectstatic --no-input
systemctl restart netbox
```

This plugin requires no database migrations and has no configuration parameters.

> [!IMPORTANT]
> `collectstatic` is required on every upgrade, not just the first install. The plugin's JavaScript bundle changes between releases, and a stale copy in the static root will keep being served.

## Documentation

* [Introduction](docs/index.md) — what the plugin does and how it writes changes back
* [Installation](docs/installation.md) — full installation and upgrade guide
* [Reordering a Rack](docs/usage.md) — the drag-and-drop interface
* [Development](docs/development.md) — dev setup and rebuilding the JavaScript bundle
* [Change Log](CHANGELOG.md)

## Dependencies

Python: none.

JavaScript, bundled with the plugin and pinned to the versions NetBox ships:

* [Gridstack](https://gridstackjs.com/) 12.6.0
* [Bootstrap](https://getbootstrap.com/) 5.3.8

See [Development](docs/development.md) for why these versions must track NetBox's.

## Contributing

Issues and pull requests are welcomed. See [Development](docs/development.md) for the development environment and the JavaScript build.

This repository follows the same two-branch model as NetBox itself:

* `feature` — active development of future releases. **Base your pull requests on this branch.**
* `main` — the released code. Releases are cut from here; `feature` is merged into `main` to release.

GitHub defaults the base branch to `main`, so remember to switch the base to `feature` when opening a pull request.
