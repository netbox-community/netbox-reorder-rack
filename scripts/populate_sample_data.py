#!/usr/bin/env python3
#
# Create sample data in NetBox for exercising netbox-reorder-rack.
#
# The data set is built around the cases the reorder view has to render, rather than
# around plausible-looking inventory:
#
# * devices of several heights, so multi-unit widgets are covered;
# * full-depth devices, which appear on both faces, alongside half-depth devices, which
#   appear on only one — moving a full-depth device is the case that historically broke;
# * devices mounted on the rear face, including one sitting behind a half-depth front
#   device at the same unit;
# * devices assigned to a rack with no position, which the view lists as "non-racked";
# * a child device installed in a bay, and an uninstalled child device, both of which the
#   view deliberately excludes from that list;
# * a rack numbered in descending order, and an empty rack.
#
# This is a comment block rather than a module docstring on purpose: ruff-format wants a
# blank line between a module docstring and the first import, and the reorder-python-imports
# hook removes it again, so the two hooks in .pre-commit-config.yaml never converge on a
# file that has one. See --help for usage.
import argparse
import os
import sys

import requests

# Local development defaults, overridden by the environment variables of the same name.
# This token is only good against a throwaway local NetBox; do not point it at anything
# real, and prefer setting NETBOX_TOKEN instead of relying on the default.
DEFAULT_HOST = "http://localhost:8000"
DEFAULT_TOKEN = "wtJ9SQjwXitaR8hILEIMiFvrkmIHkmkfo02VaU35"

TAG = {
    "name": "reorder-rack-sample",
    "slug": "reorder-rack-sample",
    "color": "9e9e9e",
    "description": "Sample data created by scripts/populate_sample_data.py",
}

SITE = {
    "name": "Reorder Sample Site",
    "slug": "reorder-sample-site",
    "status": "active",
}

# Nested, so the reorder view's breadcrumbs have location ancestors to walk. NetBox 4.7
# replaced django-mptt with PostgreSQL ltree for this hierarchy.
LOCATIONS = [
    {"name": "Sample Building", "slug": "sample-building"},
    {"name": "Sample Room", "slug": "sample-room", "parent": "sample-building"},
]

MANUFACTURER = {"name": "Sample Manufacturer", "slug": "sample-manufacturer"}

# Distinct colours, so the elevation's label contrast handling is exercised.
DEVICE_ROLES = [
    {"name": "Sample Switch", "slug": "sample-switch", "color": "2196f3"},
    {"name": "Sample Server", "slug": "sample-server", "color": "4caf50"},
    {"name": "Sample Storage", "slug": "sample-storage", "color": "ffeb3b"},
    {"name": "Sample Patch Panel", "slug": "sample-patch-panel", "color": "9c27b0"},
    {"name": "Sample PDU", "slug": "sample-pdu", "color": "f44336"},
    {"name": "Sample Blade", "slug": "sample-blade", "color": "607d8b"},
]

DEVICE_TYPES = [
    {
        "model": "Sample Switch 1U",
        "slug": "sample-switch-1u",
        "u_height": 1,
        "is_full_depth": False,
    },
    {
        "model": "Sample Server 1U",
        "slug": "sample-server-1u",
        "u_height": 1,
        "is_full_depth": True,
    },
    {
        "model": "Sample Server 2U",
        "slug": "sample-server-2u",
        "u_height": 2,
        "is_full_depth": True,
    },
    {
        "model": "Sample Storage 4U",
        "slug": "sample-storage-4u",
        "u_height": 4,
        "is_full_depth": True,
    },
    {
        "model": "Sample Patch Panel 1U",
        "slug": "sample-patch-panel-1u",
        "u_height": 1,
        "is_full_depth": False,
    },
    # 0U devices cannot be mounted at a position, so these only ever appear in the
    # non-racked column.
    {
        "model": "Sample PDU 0U",
        "slug": "sample-pdu-0u",
        "u_height": 0,
        "is_full_depth": False,
    },
    {
        "model": "Sample Chassis 4U",
        "slug": "sample-chassis-4u",
        "u_height": 4,
        "is_full_depth": True,
        "subdevice_role": "parent",
        "bays": ["Bay 1", "Bay 2", "Bay 3", "Bay 4"],
    },
    {
        "model": "Sample Blade",
        "slug": "sample-blade",
        "u_height": 0,
        "is_full_depth": False,
        "subdevice_role": "child",
    },
]

# Racks deliberately omit width, form_factor and the outer_* fields, all of which NetBox
# 4.7 deprecates in favour of rack types.
#
# Positions below are chosen so nothing collides. A full-depth device consumes its units
# on *both* faces, so a rear-face device may only share a unit with a half-depth front
# device — which is exactly what the rear patch panels at units 42 and 41 test.
RACKS = [
    {
        "name": "Sample Rack 1 - Mixed Depths",
        "location": "sample-room",
        "u_height": 42,
        "devices": [
            # Front face.
            ("sample-sw-01", "sample-switch-1u", "sample-switch", 42, "front"),
            ("sample-sw-02", "sample-switch-1u", "sample-switch", 41, "front"),
            ("sample-srv-01", "sample-server-1u", "sample-server", 39, "front"),
            ("sample-srv-02", "sample-server-2u", "sample-server", 37, "front"),
            ("sample-stor-01", "sample-storage-4u", "sample-storage", 33, "front"),
            ("sample-srv-03", "sample-server-2u", "sample-server", 30, "front"),
            # Rear face. The first two sit behind the half-depth switches above.
            ("sample-pp-01", "sample-patch-panel-1u", "sample-patch-panel", 42, "rear"),
            ("sample-pp-02", "sample-patch-panel-1u", "sample-patch-panel", 41, "rear"),
            ("sample-sw-03", "sample-switch-1u", "sample-switch", 20, "rear"),
            ("sample-srv-04", "sample-server-2u", "sample-server", 17, "rear"),
            # Non-racked: assigned to the rack, but not mounted.
            ("sample-pdu-01", "sample-pdu-0u", "sample-pdu", None, None),
            ("sample-pdu-02", "sample-pdu-0u", "sample-pdu", None, None),
            ("sample-srv-05", "sample-server-1u", "sample-server", None, None),
        ],
    },
    {
        "name": "Sample Rack 2 - Descending Units",
        "location": "sample-room",
        "u_height": 42,
        "desc_units": True,
        "devices": [
            ("sample-d-sw-01", "sample-switch-1u", "sample-switch", 42, "front"),
            ("sample-d-srv-01", "sample-server-2u", "sample-server", 40, "front"),
            ("sample-d-srv-02", "sample-server-1u", "sample-server", 39, "front"),
            ("sample-d-stor-01", "sample-storage-4u", "sample-storage", 35, "front"),
            (
                "sample-d-pp-01",
                "sample-patch-panel-1u",
                "sample-patch-panel",
                42,
                "rear",
            ),
        ],
    },
    {
        "name": "Sample Rack 3 - Device Bays",
        "location": "sample-building",
        "u_height": 12,
        "devices": [
            ("sample-chassis-01", "sample-chassis-4u", "sample-server", 9, "front"),
            ("sample-sw-04", "sample-switch-1u", "sample-switch", 8, "front"),
            # Appears in the non-racked column.
            ("sample-srv-06", "sample-server-1u", "sample-server", None, None),
            # Excluded from it: a child device type, assigned to the rack but not
            # installed in a bay.
            ("sample-blade-spare", "sample-blade", "sample-blade", None, None),
        ],
    },
    {
        "name": "Sample Rack 4 - Empty",
        "location": "sample-building",
        "u_height": 42,
        "devices": [],
    },
]

# Installed into the first bay of the chassis above, so it is excluded from the
# non-racked column by virtue of having a parent bay.
BAY_CHILD = {
    "name": "sample-blade-01",
    "type": "sample-blade",
    "role": "sample-blade",
    "parent": "sample-chassis-01",
    "bay": "Bay 1",
}


class NetBoxError(RuntimeError):
    """An API call returned an error response."""


class NetBox:
    """A very small NetBox REST client, just enough for this script."""

    def __init__(self, host, token):
        self.host = host.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update(
            {
                "Authorization": f"Token {token}",
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        )

    def request(self, method, endpoint, **kwargs):
        url = f"{self.host}/api/{endpoint.strip('/')}/"
        try:
            response = self.session.request(method, url, timeout=30, **kwargs)
        except requests.RequestException as exc:
            raise NetBoxError(f"{method} {url} failed: {exc}") from exc
        if not response.ok:
            raise NetBoxError(
                f"{method} {url} returned {response.status_code}: {response.text[:500]}"
            )
        if response.status_code == 204 or not response.content:
            return None
        return response.json()

    def list(self, endpoint, **params):
        params.setdefault("limit", 0)
        return self.request("GET", endpoint, params=params)["results"]

    def create(self, endpoint, data):
        return self.request("POST", endpoint, json=data)

    def update(self, endpoint, pk, data):
        return self.request("PATCH", f"{endpoint}/{pk}", json=data)

    def delete(self, endpoint, pk):
        return self.request("DELETE", f"{endpoint}/{pk}")

    def ensure(self, endpoint, lookup, data):
        """
        Return the object matching ``lookup``, creating it from ``data`` if absent.

        Existing objects are left alone rather than patched: the point is to converge on
        the sample layout without clobbering unrelated edits.
        """
        existing = self.list(endpoint, **lookup)
        if existing:
            return existing[0], False
        return self.create(endpoint, data), True


def tagged(data):
    """Attach the sample tag, so --clean can find the object later."""
    return {**data, "tags": [{"slug": TAG["slug"]}]}


def populate(nb):
    created = {"created": 0, "existing": 0}

    def record(result):
        obj, was_created = result
        created["created" if was_created else "existing"] += 1
        return obj

    # The tag itself cannot be tagged.
    record(nb.ensure("extras/tags", {"slug": TAG["slug"]}, TAG))

    site = record(nb.ensure("dcim/sites", {"slug": SITE["slug"]}, tagged(SITE)))

    locations = {}
    for spec in LOCATIONS:
        payload = {k: v for k, v in spec.items() if k != "parent"}
        payload["site"] = site["id"]
        if parent := spec.get("parent"):
            payload["parent"] = locations[parent]["id"]
        locations[spec["slug"]] = record(
            nb.ensure("dcim/locations", {"slug": spec["slug"]}, tagged(payload))
        )

    manufacturer = record(
        nb.ensure(
            "dcim/manufacturers",
            {"slug": MANUFACTURER["slug"]},
            tagged(MANUFACTURER),
        )
    )

    roles = {
        spec["slug"]: record(
            nb.ensure("dcim/device-roles", {"slug": spec["slug"]}, tagged(spec))
        )
        for spec in DEVICE_ROLES
    }

    device_types = {}
    for spec in DEVICE_TYPES:
        payload = {k: v for k, v in spec.items() if k != "bays"}
        payload["manufacturer"] = manufacturer["id"]
        device_type, was_created = nb.ensure(
            "dcim/device-types", {"slug": spec["slug"]}, tagged(payload)
        )
        record((device_type, was_created))
        device_types[spec["slug"]] = device_type
        for bay in spec.get("bays", []):
            record(
                nb.ensure(
                    "dcim/device-bay-templates",
                    {"device_type_id": device_type["id"], "name": bay},
                    {"device_type": device_type["id"], "name": bay},
                )
            )

    racks = {}
    for spec in RACKS:
        payload = {
            "name": spec["name"],
            "site": site["id"],
            "location": locations[spec["location"]]["id"],
            "status": "active",
            "u_height": spec["u_height"],
            "desc_units": spec.get("desc_units", False),
        }
        racks[spec["name"]] = record(
            nb.ensure(
                "dcim/racks",
                {"name": spec["name"], "site_id": site["id"]},
                tagged(payload),
            )
        )

    # Clear the board first. A device that has been dragged elsewhere since the last run
    # would otherwise occupy a unit another device is about to claim, and re-applying the
    # layout in place would fail on whichever collision came first.
    declared = {name for spec in RACKS for name, *_ in spec["devices"]} | {
        BAY_CHILD["name"]
    }
    for device in nb.list("dcim/devices", tag=TAG["slug"]):
        if device["name"] in declared and device["position"] is not None:
            nb.update("dcim/devices", device["id"], {"position": None, "face": None})

    devices = {}
    for spec in RACKS:
        rack = racks[spec["name"]]
        for name, type_slug, role_slug, position, face in spec["devices"]:
            payload = {
                "name": name,
                "device_type": device_types[type_slug]["id"],
                "role": roles[role_slug]["id"],
                "site": site["id"],
                "rack": rack["id"],
                "status": "active",
                "position": position,
                "face": face,
            }
            device, was_created = nb.ensure(
                "dcim/devices", {"name": name}, tagged(payload)
            )
            record((device, was_created))
            devices[name] = device
            if not was_created and position is not None:
                # Put it back where the layout says it belongs.
                nb.update(
                    "dcim/devices",
                    device["id"],
                    {"position": position, "face": face},
                )

    install_bay_child(nb, devices, device_types, roles, site, record)

    print(
        f"\n{created['created']} objects created, {created['existing']} already present."
    )
    print("\nReorder pages:")
    for spec in RACKS:
        rack = racks[spec["name"]]
        print(f"  {spec['name']:<32} {nb.host}/dcim/racks/{rack['id']}/reorder/")


def install_bay_child(nb, devices, device_types, roles, site, record):
    """Create the blade and install it in the chassis, if it is not already there."""
    parent = devices.get(BAY_CHILD["parent"])
    if parent is None:
        return

    bays = nb.list("dcim/device-bays", device_id=parent["id"], name=BAY_CHILD["bay"])
    if not bays:
        print(
            f"  ! no bay {BAY_CHILD['bay']!r} on {BAY_CHILD['parent']}, skipping blade"
        )
        return
    bay = bays[0]

    if bay["installed_device"]:
        record((bay, False))
        return

    child, was_created = nb.ensure(
        "dcim/devices",
        {"name": BAY_CHILD["name"]},
        tagged(
            {
                "name": BAY_CHILD["name"],
                "device_type": device_types[BAY_CHILD["type"]]["id"],
                "role": roles[BAY_CHILD["role"]]["id"],
                "site": site["id"],
                "status": "active",
            }
        ),
    )
    record((child, was_created))
    nb.update("dcim/device-bays", bay["id"], {"installed_device": child["id"]})


def clean(nb):
    """
    Delete everything carrying the sample tag.

    Ordered so that referenced objects go last. Devices installed in bays are removed
    before their parents, and locations deepest-first.
    """
    if not nb.list("extras/tags", slug=TAG["slug"]):
        print(f"No {TAG['slug']!r} tag on {nb.host}; nothing to clean up.")
        return

    devices = nb.list("dcim/devices", tag=TAG["slug"])
    children = [d for d in devices if d.get("parent_device")]
    parents = [d for d in devices if not d.get("parent_device")]

    plan = [
        ("dcim/devices", children),
        ("dcim/devices", parents),
        ("dcim/racks", nb.list("dcim/racks", tag=TAG["slug"])),
        ("dcim/device-types", nb.list("dcim/device-types", tag=TAG["slug"])),
        ("dcim/device-roles", nb.list("dcim/device-roles", tag=TAG["slug"])),
        ("dcim/manufacturers", nb.list("dcim/manufacturers", tag=TAG["slug"])),
        (
            "dcim/locations",
            sorted(
                nb.list("dcim/locations", tag=TAG["slug"]),
                key=lambda loc: loc.get("_depth", 0),
                reverse=True,
            ),
        ),
        ("dcim/sites", nb.list("dcim/sites", tag=TAG["slug"])),
        ("extras/tags", nb.list("extras/tags", slug=TAG["slug"])),
    ]

    total = sum(len(objects) for _, objects in plan)
    if not total:
        print(f"Nothing tagged {TAG['slug']!r} on {nb.host}.")
        return

    print(f"Deleting {total} tagged objects from {nb.host}:")
    for endpoint, objects in plan:
        for obj in objects:
            label = obj.get("name") or obj.get("model") or obj.get("display")
            print(f"  {endpoint}/{obj['id']} {label}")
            nb.delete(endpoint, obj["id"])
    print(f"\n{total} objects deleted.")


def main():
    parser = argparse.ArgumentParser(
        description="Create sample rack and device data for netbox-reorder-rack.",
        epilog=(
            "Connection details come from the environment: NETBOX_HOST (default "
            f"{DEFAULT_HOST}) and NETBOX_TOKEN. Every object created is tagged "
            f"{TAG['slug']!r}, which is how --clean finds them again. Re-running clears "
            "the positions of the sample devices and re-applies the layout, so a rack "
            "that has been rearranged in the UI can be reset for another test."
        ),
    )
    parser.add_argument(
        "--clean",
        action="store_true",
        help="delete the sample data instead of creating it",
    )
    args = parser.parse_args()

    host = os.environ.get("NETBOX_HOST", DEFAULT_HOST)
    token = os.environ.get("NETBOX_TOKEN", DEFAULT_TOKEN)
    nb = NetBox(host, token)

    try:
        status = nb.request("GET", "status")
    except NetBoxError as exc:
        sys.exit(f"Could not reach NetBox at {host}: {exc}")

    print(f"NetBox {status.get('netbox-version')} at {host}")
    if "netbox_reorder_rack" not in status.get("plugins", {}):
        print("  ! netbox_reorder_rack is not installed on this instance")

    try:
        clean(nb) if args.clean else populate(nb)
    except NetBoxError as exc:
        sys.exit(f"\n{exc}")


if __name__ == "__main__":
    main()
