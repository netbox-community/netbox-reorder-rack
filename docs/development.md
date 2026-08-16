# Development - Netbox Reorder Rack

## Installation
```shell
git clone ...
cd netbox-reorder-rack
source /opt/netbox/venv/bin/activate
pip install -e .
```

Edit `configuration.py` to include the plugin:
```python
PLUGINS = ["netbox_reorder_rack"]
```

Start the development server:
```shell
python3 manage.py runserver
```

## JavaScript Development

Source files live in `netbox_reorder_rack/static_dev/`. Edit those, then rebuild the
bundle that NetBox actually serves from `netbox_reorder_rack/static/`.

**Use `yarn`, not `npm`.** This project is locked with `yarn.lock`, matching NetBox core,
which is also locked with yarn. Running `npm install` creates a competing
`package-lock.json`; the two lockfiles then disagree, and because npm auto-installs peer
dependencies while yarn does not, whether the bundle builds ends up depending on which
tool ran last.

```shell
cd netbox_reorder_rack/static_dev
yarn install
node bundle.js          # or: yarn bundle
```

`node bundle.js` builds both the scripts and the styles. To build only one:

```shell
yarn bundle:scripts
yarn bundle:styles
```

Commit the rebuilt `static/netbox_reorder_rack/js/rack.js` and its `.map` alongside your
`static_dev/` change — the built bundle is checked in, because NetBox serves it directly and
there is no build step at install time.

### Front-end dependency versions

Gridstack and Bootstrap are pinned to the exact versions NetBox ships, and should be updated
in step with it. This matters because NetBox loads **gridstack's CSS globally** (it imports
`gridstack/dist/gridstack.min.css` in its own `external.scss`), while this plugin bundles
gridstack's **JavaScript** — so a version drift pairs one generation of the CSS with another
of the engine. Check NetBox's `netbox/project-static/package.json` for the versions to match.

Two unmet peer dependency warnings from `yarn install` are expected and harmless:
`@popperjs/core` (only needed by the Bootstrap components this plugin does not use — it
imports `Toast` directly to avoid pulling them in) and `sass-embedded` (only needed to
compile `.scss`, and the styles here are plain CSS).
