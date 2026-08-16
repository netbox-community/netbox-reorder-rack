# AGENTS.md — netbox-reorder-rack

## Repository Overview

`netbox-reorder-rack` is a NetBox plugin that adds a drag-and-drop rack elevation. Devices are repositioned by dragging them between units, between the front and rear faces, and in and out of a non-racked list; on save, the arrangement is written back as ordinary `Device.position` and `Device.face` values.

The plugin has **no models, no migrations, and no configuration parameters**. It consists of a `PluginTemplateExtension` (the Reorder button), one view that renders the elevation, one REST endpoint that saves it, a set of template filters, and a bundled browser-side editor. The supported NetBox range is in `COMPATIBILITY.md`.

Because it stores nothing of its own, all of its behaviour is *read NetBox state → rearrange in the browser → write device positions back*. There is no plugin-owned data to get out of step.

## Tech Stack

- Python — no version declared in `setup.py`; NetBox's own floor applies
- NetBox (host app) — **no `min_version` / `max_version` declared**, so NetBox will not gate loading. `COMPATIBILITY.md` records the tested ranges
- Django + Django REST Framework (provided by NetBox)
- [Gridstack](https://gridstackjs.com/) **12.6.0** and [Bootstrap](https://getbootstrap.com/) **5.3.8** — bundled, pinned to the versions NetBox ships
- esbuild **0.28.2** — bundler, a devDependency. **yarn only**; see Front-end below
- NetBox's test framework (`utilities.testing.TestCase`), run through `manage.py test`
- pre-commit (`.pre-commit-config.yaml`) with djlint for templates (`.djlintrc`)

The plugin declares **no** `install_requires`. All front-end versions are pinned exactly — no `^` or `~`.

## Repository Map

```text
.
├── netbox_reorder_rack/
│   ├── __init__.py              — PluginConfig. No default_settings, no version pins.
│   ├── template_content.py      — ReorderButton (PluginTemplateExtension) on dcim.rack.
│   ├── views.py                 — ReorderView: registered on Rack via register_model_view,
│   │                              renders the elevation from rack.get_rack_units().
│   ├── urls.py                  — Wires the model view through get_model_urls('dcim','rack').
│   ├── api/views.py             — SaveViewSet: validates and writes device positions in one
│   │                              transaction. Not a NetBoxModelViewSet; schema is disabled.
│   ├── api/urls.py              — NetBoxRouter, registered as 'save'.
│   ├── templatetags/rack.py     — Filters used by the elevation template.
│   ├── templates/netbox_reorder_rack/
│   │   ├── rack.html            — Thin shell: extends generic/object.html, supplies only the
│   │   │                          CSS/JS asset blocks. Page body comes from the view's layout.
│   │   ├── inc/reorder.html     — The elevation, rendered as a TemplatePanel.
│   │   ├── inc/rack_elevation.html — One elevation (front or rear).
│   │   └── inc/rack_button.html — The Reorder button.
│   ├── static/netbox_reorder_rack/  — BUILT OUTPUT, committed. Do not hand-edit.
│   │   ├── js/rack.js (+ .map)
│   │   └── css/rack.css
│   ├── static_dev/              — Front-end sources and the bundler.
│   │   ├── js/rack.js           — Edit this, then rebuild.
│   │   ├── css/rack.css         — Plain CSS. No Sass.
│   │   ├── bundle.js            — esbuild build script.
│   │   ├── package.json
│   │   └── yarn.lock            — The only lockfile. Do not add package-lock.json.
│   └── tests/                   — test_view.py, test_api.py. Need PostgreSQL via NetBox.
├── docs/                        — mkdocs site (see mkdocs.yml for nav).
├── CHANGELOG.md                 — Canonical changelog; docs/changelog.md includes it.
├── COMPATIBILITY.md             — Plugin release to NetBox version matrix.
└── .github/workflows/
    ├── pre-commit.yml           — Runs pre-commit. The test suite does NOT run in CI.
    └── python-publish.yml       — Publishes to PyPI.
```

## Architecture

### The round trip

```
Rack detail view
  └─ ReorderButton (template_content.py) → dcim:rack_reorder
       └─ ReorderView (views.py) — a generic.ObjectView with a declarative layout
            get_extra_context() supplies rack.get_rack_units(expand_devices=False, face=...)
            for both faces plus non-racked devices, to inc/reorder.html via a TemplatePanel
              └─ static/.../rack.js (Gridstack) rearranges in the browser
                   └─ PUT /api/plugins/reorder/save/<rack_pk>/
                        └─ SaveViewSet writes Device.position / Device.face
```

`expand_devices=False` matters: it returns only the bottom-most unit for a multi-U device, with a `height` attribute, which is what the grid needs. Passing `True` would repeat the device once per unit.

### Saving

`SaveViewSet.update()` takes three lists — `front`, `rear`, `other` — and for each device compares the submitted position and face against the current values, writing only what changed. Everything happens inside `transaction.atomic()`, each device is validated with `device.clean()` before `save()`, and object-level permission is checked per device via `get_permission_for_model`. A device the user cannot change aborts the whole save.

`other` is the non-racked list: those devices get `position = None` and `face = ""`.

### Views

`ReorderView` is a `generic.ObjectView` on `Rack` (not on a plugin model), registered with `register_model_view(Rack, name="reorder", path="reorder")`, which produces the URL name `dcim:rack_reorder`. It carries a `ViewTab`, so it appears as a tab on the rack.

Its page is built from NetBox's declarative UI components (available since NetBox 4.5; breadcrumbs since 4.7): a `SimpleLayout` supplies the breadcrumbs and a `TemplatePanel` embeds the elevation. This is how NetBox renders its own rack elevations. See [UI Components](https://netboxlabs.com/docs/netbox/plugins/development/ui-components/).

`has_permission()` is overridden rather than `get_required_permission()`. NetBox's default restricts the view's queryset using the required permission's action, which would demand *rack* permissions; this view repositions devices, so it requires `dcim.view_device` and `dcim.change_device` and leaves the rack queryset unrestricted — the contract it has always had.

`SaveViewSet` is a bare DRF `ViewSet`, not a `NetBoxModelViewSet` — there is no model to serialize.

**Known issue.** Mixing Django's `PermissionRequiredMixin` with a DRF `ViewSet` means the mixin's `dispatch()` raises `PermissionDenied` **before** the view's own `except PermissionDenied` handler can run, so it escapes the view. This is why `test_api.ReorderRackAPITest.test_reorder_rack_view_without_permissions` asserts a 500 and currently errors. DRF `permission_classes` would be the correct mechanism, and the expected status should be 403. Pre-existing; fails identically on 4.6.8 and 4.7.

### Template blocks

`rack.html` extends `generic/object.html`, which defines `breadcrumbs`, `object_identifier`, `subtitle`, `tabs`, `title` and `content`. The template overrides only `head` and `javascript` — the asset blocks a panel cannot reach — and lets everything else come from the layout.

It previously extended `base/layout.html` and hand-copied that chrome. `base/layout.html` defines none of `subtitle`, `tabs` or `content-wrapper`, and Django ignores unknown blocks silently, so those three never rendered. Extend `generic/object.html` for object pages.

### Front-end

The bundle is **committed** to `static/`, because NetBox serves it directly and there is no build step at install time. Edit `static_dev/`, run the bundler, commit both.

Two constraints that are easy to get wrong:

- **Use yarn, not npm.** The project is locked with `yarn.lock`, matching NetBox core. npm auto-installs peer dependencies and yarn does not, so a stray `npm install` creates a second lockfile and makes the build succeed or fail depending on which tool ran last.
- **NetBox loads Gridstack's CSS globally** (it imports `gridstack/dist/gridstack.min.css` in its own `external.scss`) while this plugin bundles Gridstack's **JavaScript**. The versions must match, or one generation of the engine runs against another's stylesheets — v12 moved positioning from generated stylesheets to CSS variables.

Gridstack API notes for this version: `addWidget()` does **not** accept an `HTMLElement` (v11+) — use `makeWidget()`. `disableOneColumnMode` was removed in v12.1.0; responsive collapsing is opt-in via `columnOpts`, absent from the defaults, so omitting it is correct.

`Toast` is imported from `bootstrap/js/dist/toast.js`, not from `bootstrap`, to avoid pulling in the components that need `@popperjs/core` — an undeclared peer dependency.

### Key files

| File | Why you'd open it |
|---|---|
| `netbox_reorder_rack/views.py` | What the elevation is built from |
| `netbox_reorder_rack/api/views.py` | How a save is validated and written |
| `netbox_reorder_rack/templatetags/rack.py` | Unit positioning maths for the template |
| `netbox_reorder_rack/static_dev/js/rack.js` | All drag-and-drop behaviour |
| `netbox_reorder_rack/static_dev/bundle.js` | The esbuild build |

## Commands

| Command | What it does |
|---|---|
| `yarn install` (in `static_dev/`) | Install the front-end toolchain |
| `node bundle.js` | Rebuild both the JS bundle and the CSS |
| `yarn bundle:scripts` / `yarn bundle:styles` | Rebuild one of them |
| `yarn audit` | Check the front-end dependency tree |
| `python manage.py test netbox_reorder_rack` | Run the tests (inside a NetBox install) |
| `pre-commit run --all-files` | Lint, including djlint on templates |
| `mkdocs build --strict` | Build the docs; fails on broken internal links |

There is no Makefile and no Docker Compose environment in this repo; the tests need a NetBox checkout with PostgreSQL.

## Testing

- Tests use NetBox's `utilities.testing.TestCase` and live in `netbox_reorder_rack/tests/`.
- A real PostgreSQL database is created; there is nothing to mock.
- `test_view.py` renders the reorder page, which exercises the whole template chain, the template filters, `get_rack_units()`, and `Location.get_ancestors()` in the breadcrumb. It is the single most useful test for compatibility work.
- `test_api.py` drives the save endpoint with and without permissions.
- **The tests exercise no JavaScript.** A green suite says nothing about whether dragging works. Any change to `static_dev/` needs manual browser verification: drag within a face, between front and rear, a full-depth device, to and from non-racked, then Save.

## CI/CD

- **`pre-commit.yml`** — runs pre-commit on push/PR. The **test suite does not run in CI**, so run it locally.
- **`python-publish.yml`** — publishes to PyPI.

There is no JavaScript linting in `.pre-commit-config.yaml`, so `static_dev/js/rack.js` has no automated guard at all.

## Common Tasks

### Change the drag-and-drop behaviour

Edit `static_dev/js/rack.js`, then from `static_dev/`: `yarn install` (first time) and `node bundle.js`. Commit the rebuilt `static/netbox_reorder_rack/js/rack.js` and its `.map` alongside the source change. Verify in a browser — nothing else will.

### Bump Gridstack or Bootstrap

Match the versions in NetBox's `netbox/project-static/package.json`, pin them exactly, rebuild, and update the version list in `README.md` (which states them explicitly). Check the Gridstack changelog for breaking changes; the last upgrade crossed two majors and needed two call-site fixes.

### Support a new NetBox version

There are no version pins to bump. Instead: add a row to `COMPATIBILITY.md`, run the test suite against the new version, and check the internals in the Architecture section above still exist — this plugin reaches further into NetBox than most, including `dcim.svg.racks.get_device_name`, `utilities.html.foreground_color`, `netbox.config.get_config`, and `Rack.get_rack_units()`.

## Conventions and Patterns

- **Branches.** `feature` is active development and the base for pull requests. `main` is released code and what releases are cut from.
- **Changelog.** User-visible changes go in the root `CHANGELOG.md`. Do not edit `docs/changelog.md` — it is a one-line `pymdownx.snippets` include (`--8<-- "CHANGELOG.md"`) so there is a single source of truth. Keep GitHub-flavoured Markdown there rather than mkdocs admonitions, since it is read on GitHub too.
- **Never hand-edit `static/`.** It is build output.
- **Never add `package-lock.json`.**
- **The built bundle is committed.** A dependency or source change is incomplete without the rebuilt output.

## Troubleshooting

**The elevation renders but nothing drags.** `collectstatic` has not been run, or a stale bundle is being served. Check the browser console for a 404 on `netbox_reorder_rack/js/rack.js`.

**The Reorder button is missing.** It requires `dcim.change_device`.

**A save fails with a permissions error.** Object-level permissions are checked per device; one device the user cannot change rejects the entire save.

**`Could not resolve "@popperjs/core"` when bundling.** Something reintroduced an import from `bootstrap` rather than `bootstrap/js/dist/toast.js`, or a `package-lock.json` reappeared and npm/yarn disagree about peers.

**Devices overlap or sit at the wrong height after a change to the template filters.** `calculate_u_position` in `templatetags/rack.py` works in half-units (it doubles `u_height`) and inverts the axis unless the rack is `desc_units`. Both cases need checking.

## References

- User documentation: `docs/` (built with mkdocs; `mkdocs.yml` has the nav)
- Supported NetBox versions: `COMPATIBILITY.md`
- [NetBox plugin development docs](https://netboxlabs.com/docs/netbox/plugins/development/)
- [Gridstack documentation](https://gridstackjs.com/) and its [changelog](https://github.com/gridstack/gridstack.js/blob/master/doc/CHANGES.md) — essential before any version bump
- `Rack.get_rack_units()` in NetBox's `dcim/models/racks.py` — the source of the elevation
