# Change Log

## Unreleased

**Verified against NetBox 4.7.** The plugin's own test suite was run against both NetBox 4.7
and 4.6.8 with identical results, and every NetBox internal the plugin depends on — including
`Rack.get_rack_units()`, `dcim.svg.racks.get_device_name`, `utilities.html.foreground_color`,
and `Location.get_ancestors()` after 4.7 replaced django-mptt with PostgreSQL `ltree` — was
confirmed present. No plugin code changes were required for 4.7 itself.

A version number has not yet been assigned to this work. The front-end upgrades below cross
two major versions of Gridstack, so a minor release rather than a patch is appropriate.

### Breaking Changes

* None for users. The changes below are confined to the bundled front-end assets and the
  development toolchain; the Python API, REST endpoint, and permissions are unchanged.

### Bug Fixes

* **Gridstack upgraded from 10.1.2 to 12.6.0**, matching the version NetBox ships. NetBox
  loads Gridstack's **CSS** globally (it imports `gridstack/dist/gridstack.min.css` into its
  own `external.scss`), while this plugin bundles Gridstack's **JavaScript** — so the rack
  elevation was running a v10 engine against v12 stylesheets, two generations apart, after
  v12 moved positioning from generated stylesheets to CSS variables.

    Two breaking changes in that range were fixed:

    * `addWidget()` stopped accepting an `HTMLElement` in v11. Copying a full-depth device to
      the opposite rack face passed a cloned element, which logged a console error on every
      drop before falling back internally. It now calls `makeWidget()`.
    * `disableOneColumnMode` was removed in v12.1.0 and had become a silently ignored option.
      Responsive column collapsing is now opt-in via `columnOpts`, which is absent from
      Gridstack's defaults, so omitting the option preserves the fixed layout it requested.

* **Bootstrap pinned to 5.3.8**, matching NetBox. The plugin now imports `Toast` directly from
  `bootstrap/js/dist/toast.js` rather than from the package entry point. The entry point pulls
  in every component, including those requiring `@popperjs/core` — a peer dependency this
  project never declared, so the bundle only built when a package manager happened to
  auto-install it. npm does, yarn does not, which made the build succeed or fail depending on
  which tool ran last. Importing `Toast` directly removes the dependency entirely and reduces
  the bundle from 172,799 to 109,502 bytes.

### Other Changes

* **The reorder page now uses NetBox's declarative UI components.** `ReorderView` is a
  `generic.ObjectView` carrying a `SimpleLayout`, with the elevation embedded as a
  `TemplatePanel` — the same approach NetBox uses for its own rack elevations. The page also
  registers a `ViewTab`, so it appears as a tab on the rack rather than a standalone page.

    This fixes chrome that never rendered. The template previously extended
    `base/layout.html` and hand-copied NetBox's breadcrumbs, object identifier, subtitle and
    tab strip; `base/layout.html` defines no `subtitle`, `tabs` or `content-wrapper` blocks,
    and Django ignores unknown blocks silently, so the subtitle and tab strip were absent on
    every page load. Both now render. `rack.html` drops from 143 lines to 18, keeping only the
    CSS and JavaScript blocks a panel cannot reach.

* **Fixed a duplicated `gs-locked` attribute** in the rack elevation template. Because HTML
  uses the first of a duplicated attribute, the literal `gs-locked="false"` overrode the
  permission-derived value that followed it, so rear-face devices were never lock-flagged for
  users without change permission. Dragging was still prevented by `gs-no-move`, which was not
  duplicated, so this weakened the lock rather than bypassing permissions. It was also the
  outstanding `djlint` H037 error, so `pre-commit` now passes.

* **All four outstanding dependency advisories resolved** (`braces`, `picomatch`, `immutable`,
  `esbuild`). None was reachable by users — all were build-time only, and none appears in the
  shipped bundle. Three came solely from `esbuild-sass-plugin` → `sass` → `chokidar`, which was
  removed: there are no `.scss` files and the stylesheet uses no Sass features, so esbuild
  bundles the plain CSS natively. The CSS output is byte-identical. `esbuild` was upgraded to
  0.28.2 for the remaining advisory. `yarn audit` now reports no vulnerabilities, and the
  install dropped from over 200 audited packages to 29.

* **Every front-end dependency is now pinned exactly**, with no `^` or `~` ranges. Gridstack
  and Bootstrap so they cannot drift from the versions NetBox serves; esbuild because it is
  pre-1.0 and because it determines the bytes of the committed bundle.

* **Removed `package-lock.json`.** The project carried both it and `yarn.lock`, which
  disagreed about peer dependencies — the direct cause of the Bootstrap build fragility above.
  `yarn.lock` is retained: it is the original lockfile, and NetBox core is also locked with
  yarn.

### Housekeeping

* Documentation restructured into an MkDocs site, with the compatibility matrix moved out of
  the README into `COMPATIBILITY.md`. A duplicated `v4.1.x` row was removed from the matrix in
  the process.

* `docs/img/development.md` moved to `docs/development.md` — it is a development guide, not an
  image — and expanded to cover installing the JavaScript toolchain, which it previously
  omitted entirely, so a fresh clone could not build the bundle.

* Corrected issue and repository links, which pointed at a repository that no longer hosts
  this plugin.

---

## Earlier Releases

Releases prior to this change log are recorded on the
[GitHub releases page](https://github.com/netbox-community/netbox-reorder-rack/releases), with
their supported NetBox versions in
[`COMPATIBILITY.md`](https://github.com/netbox-community/netbox-reorder-rack/blob/main/COMPATIBILITY.md).
