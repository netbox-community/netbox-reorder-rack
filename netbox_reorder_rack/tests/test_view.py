import re
from decimal import Decimal

from core.models import ObjectType
from dcim.models import Device
from dcim.models import DeviceRole
from dcim.models import DeviceType
from dcim.models import Manufacturer
from dcim.models import Rack
from dcim.models import Site
from users.models import ObjectPermission
from utilities.testing import TestCase


class ReorderRackTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        site = Site.objects.create(name="Site 1", slug="site-1")
        Rack.objects.create(name="Rack 1", site=site, u_height=42)

    def test_reorder_rack_view_without_permissions(self):
        rack = Rack.objects.all().first()
        response = self.client.get(f"/dcim/racks/{rack.pk}/reorder/")
        self.assertHttpStatus(response, 403)

    def test_reorder_rack_view_with_permissions(self):
        # Add model-level permission
        obj_perm = ObjectPermission(name="Test permission", actions=["change", "view"])
        obj_perm.save()
        obj_perm.users.add(self.user)
        obj_perm.object_types.add(ObjectType.objects.get_for_model(Device))
        rack = Rack.objects.all().first()

        response = self.client.get(f"/dcim/racks/{rack.pk}/reorder/")
        self.assertHttpStatus(response, 200)

    def test_fractional_unit_devices_span_the_right_rows(self):
        """
        Issues #25 and #35: 0.5U and 1.5U devices were truncated to whole units.

        The grid is two rows per rack unit, so a 0.5U device is one row tall and a 1.5U
        device three. Truncating the height before doubling it made 1.5U render as 1U and
        0.5U render as nothing, which also threw off every position derived from it.
        """
        obj_perm = ObjectPermission(name="Test permission", actions=["change", "view"])
        obj_perm.save()
        obj_perm.users.add(self.user)
        obj_perm.object_types.add(ObjectType.objects.get_for_model(Device))

        site = Site.objects.first()
        rack = Rack.objects.create(name="Fractional Rack", site=site, u_height=12)
        manufacturer = Manufacturer.objects.create(name="Fractional Manufacturer")
        role = DeviceRole.objects.create(name="Fractional Role", slug="fractional-role")

        heights = {}
        for u_height, slug in (
            (Decimal("0.5"), "half-u"),
            (Decimal("1.5"), "one-and-a-half-u"),
        ):
            heights[slug] = DeviceType.objects.create(
                manufacturer=manufacturer,
                model=f"Fractional {u_height}U",
                slug=slug,
                u_height=u_height,
                is_full_depth=False,
            )

        # Two 0.5U devices filling U5, and a 1.5U device occupying U7 to U8.
        placements = [
            ("half-lower", "half-u", Decimal("5")),
            ("half-upper", "half-u", Decimal("5.5")),
            ("tall", "one-and-a-half-u", Decimal("7")),
        ]
        devices = {}
        for name, slug, position in placements:
            device = Device(
                name=name,
                device_type=heights[slug],
                site=site,
                rack=rack,
                position=position,
                face="front",
                role=role,
            )
            device.clean()
            device.save()
            devices[name] = device

        response = self.client.get(f"/dcim/racks/{rack.pk}/reorder/")
        self.assertHttpStatus(response, 200)
        html = response.content.decode()

        def widget(device):
            match = re.search(
                r'<div class="grid-stack-item"[^>]*?gs-id="%d"[^>]*?>' % device.pk, html
            )
            if match is None:
                # Attribute order differs between the two branches of the template.
                match = re.search(
                    r'<div class="grid-stack-item"(?:[^>]*?)gs-id="%d"(?:[^>]*?)>'
                    % device.pk,
                    html,
                    re.S,
                )
            self.assertIsNotNone(match, f"no widget rendered for {device.name}")
            tag = match.group(0)
            return {
                "h": int(re.search(r'gs-h="(-?\d+)"', tag).group(1)),
                "y": int(re.search(r'gs-y="(-?\d+)"', tag).group(1)),
            }

        # Rows count from the top of a 12U rack, so U5's upper half is row 14 and its lower
        # half row 15; the 1.5U device's topmost half-unit is U8's lower half, row 9.
        self.assertEqual(widget(devices["half-lower"]), {"h": 1, "y": 15})
        self.assertEqual(widget(devices["half-upper"]), {"h": 1, "y": 14})
        self.assertEqual(widget(devices["tall"]), {"h": 3, "y": 9})
