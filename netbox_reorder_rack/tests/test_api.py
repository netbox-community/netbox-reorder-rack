from core.models import ObjectType
from dcim.models import Device
from dcim.models import DeviceRole
from dcim.models import DeviceType
from dcim.models import Manufacturer
from dcim.models import Rack
from dcim.models import Site
from users.models import ObjectPermission
from utilities.testing import TestCase


class ReorderRackAPITest(TestCase):
    @classmethod
    def setUpTestData(cls):
        site = Site.objects.create(name="Test Site")
        rack = Rack.objects.create(
            name="Test Rack 1", site=Site.objects.first(), u_height=42
        )
        manufacturer = Manufacturer.objects.create(name="Test Manufacturer")
        role = DeviceRole.objects.create(name="Test Role")
        device_type1 = DeviceType.objects.create(
            manufacturer=manufacturer,
            model="Test Device Type 1",
            slug="test-device-type-1",
            u_height=1,
            is_full_depth=True,
        )
        device_type2 = DeviceType.objects.create(
            manufacturer=manufacturer,
            model="Test Device Type 2",
            slug="test-device-type-2",
            u_height=5,
            is_full_depth=True,
        )
        device_type3 = DeviceType.objects.create(
            manufacturer=manufacturer,
            model="Test Device Type 3",
            slug="test-device-type-3",
            u_height=1,
            is_full_depth=False,
        )
        device1 = Device(
            name="Device 1",
            device_type=device_type1,
            site=site,
            rack=rack,
            position=1,
            face="front",
            role=role,
        )
        device2 = Device(
            name="Device 2",
            device_type=device_type2,
            site=site,
            rack=rack,
            position=2,
            face="front",
            role=role,
        )
        device3 = Device(
            name="Device 3",
            device_type=device_type3,
            site=site,
            rack=rack,
            position=40,
            face="rear",
            role=role,
        )
        device4 = Device(
            name="Device 4",
            device_type=device_type1,
            site=site,
            rack=rack,
            position=41,
            face="rear",
            role=role,
        )
        devices = [device1, device2, device3, device4]

        for device in devices:
            device.clean()
            device.save()

    def grant_change_permission(self):
        obj_perm = ObjectPermission(name="Test permission", actions=["view", "change"])
        obj_perm.save()
        obj_perm.users.add(self.user)
        obj_perm.object_types.add(ObjectType.objects.get_for_model(Device))

    def build_rack(self, name, u_height, specs):
        """
        Build a rack from (device_name, u_height, position) triples.

        A position of None leaves the device assigned to the rack but unmounted.
        """
        site = Site.objects.first()
        manufacturer = Manufacturer.objects.first()
        role = DeviceRole.objects.first()
        rack = Rack.objects.create(name=name, site=site, u_height=u_height)

        for device_name, device_u_height, position in specs:
            device_type, _ = DeviceType.objects.get_or_create(
                manufacturer=manufacturer,
                model=f"Test Device Type {device_u_height}U Full",
                slug=f"test-device-type-{device_u_height}u-full",
                u_height=device_u_height,
                is_full_depth=True,
            )
            device = Device(
                name=device_name,
                device_type=device_type,
                site=site,
                rack=rack,
                position=position,
                face="front" if position else "",
                role=role,
            )
            device.clean()
            device.save()

        return rack

    def put_layout(self, rack, front):
        """PUT a front-face layout given as (device, position) pairs, in order."""
        data = {
            "rack_id": rack.pk,
            "front": [
                {
                    "id": device.pk,
                    "x": 0,
                    "y": position,
                    "is_full_depth": "True",
                    "face": "front",
                }
                for device, position in front
            ],
            "rear": [],
            "other": [],
        }
        return self.client.put(
            f"/api/plugins/reorder/save/{rack.pk}/",
            data,
            content_type="application/json",
        )

    def test_shift_devices_down(self):
        """
        Inserting a device at the top and pushing the rest down must succeed.

        Each device moves into the unit the one above it is vacating, so saving them in
        the order the grid reports them would validate a device against a unit that is
        still occupied.
        """
        self.grant_change_permission()
        rack = self.build_rack(
            "Test Rack Shift",
            12,
            [("Chassis", 4, 9), ("Switch", 1, 8), ("Spare", 1, None)],
        )
        chassis = Device.objects.get(name="Chassis")
        switch = Device.objects.get(name="Switch")
        spare = Device.objects.get(name="Spare")

        # Ordered top-to-bottom, which is the order that fails without a vacate pass:
        # the chassis is asked for U8 while the switch is still there.
        resp = self.put_layout(rack, [(spare, 12), (chassis, 8), (switch, 7)])
        self.assertHttpStatus(resp, 201)

        for device, expected in [(spare, 12), (chassis, 8), (switch, 7)]:
            device.refresh_from_db()
            self.assertEqual(device.position, expected)
            self.assertEqual(device.face, "front")

    def test_move_two_stacked_devices_down(self):
        """
        Issue #34: moving more than one device down at a time.

        Two 2U devices sit on top of each other and both move down by 2U, so the upper one
        is asked for units the lower one has not left yet. Moving either on its own always
        worked, which is what made the report specific to multiple devices.
        """
        self.grant_change_permission()
        rack = self.build_rack(
            "Test Rack Stacked", 12, [("Upper", 2, 10), ("Lower", 2, 8)]
        )
        upper = Device.objects.get(name="Upper")
        lower = Device.objects.get(name="Lower")

        resp = self.put_layout(rack, [(upper, 8), (lower, 6)])
        self.assertHttpStatus(resp, 201)

        upper.refresh_from_db()
        lower.refresh_from_db()
        self.assertEqual(upper.position, 8)
        self.assertEqual(lower.position, 6)

    def test_swap_two_devices(self):
        """
        Two devices exchanging units must succeed.

        There is no order in which these two saves can both validate, so this fails
        unless the units are vacated before either device is placed.
        """
        self.grant_change_permission()
        rack = self.build_rack("Test Rack Swap", 12, [("Lower", 1, 1), ("Upper", 1, 2)])
        lower = Device.objects.get(name="Lower")
        upper = Device.objects.get(name="Upper")

        resp = self.put_layout(rack, [(lower, 2), (upper, 1)])
        self.assertHttpStatus(resp, 201)

        lower.refresh_from_db()
        upper.refresh_from_db()
        self.assertEqual(lower.position, 2)
        self.assertEqual(upper.position, 1)

    def test_unchanged_layout_reports_no_changes(self):
        """Re-sending the current layout must not write anything."""
        self.grant_change_permission()
        rack = self.build_rack("Test Rack Static", 12, [("Static", 1, 5)])
        static = Device.objects.get(name="Static")

        resp = self.put_layout(rack, [(static, 5)])
        self.assertHttpStatus(resp, 304)

    def test_reorder_rack_view_without_permissions(self):
        rack = Rack.objects.get(name="Test Rack 1")
        device1 = Device.objects.get(name="Device 1")
        device2 = Device.objects.get(name="Device 2")
        device3 = Device.objects.get(name="Device 3")
        device4 = Device.objects.get(name="Device 4")

        data = {
            "front": [
                {
                    "id": device1.pk,
                    "x": 0,
                    "y": 42,
                    "is_full_depth": "True",
                    "face": "front",
                },
                {
                    "id": device2.pk,
                    "x": 0,
                    "y": 35,
                    "is_full_depth": "True",
                    "face": "front",
                },
                {
                    "id": device3.pk,
                    "x": 0,
                    "y": 1,
                    "is_full_depth": "False",
                    "face": "front",
                },
                {
                    "id": device4.pk,
                    "x": 0,
                    "y": 2,
                    "is_full_depth": "True",
                    "face": "front",
                },
            ],
            "rack_id": rack.pk,
            "rear": [],
            "other": [
                {
                    "id": device4.pk,
                    "x": 0,
                    "y": 2,
                    "is_full_depth": "True",
                    "face": None,
                }
            ],
        }

        resp = self.client.put(
            f"/api/plugins/reorder/save/{rack.pk}/",
            data,
            content_type="application/json",
        )
        self.assertHttpStatus(resp, 500)

    def test_reorder_rack_view_with_permissions(self):
        # Add model-level permission
        obj_perm = ObjectPermission(name="Test permission", actions=["view", "change"])
        obj_perm.save()
        obj_perm.users.add(self.user)
        obj_perm.object_types.add(ObjectType.objects.get_for_model(Device))

        rack = Rack.objects.get(name="Test Rack 1")
        device1 = Device.objects.get(name="Device 1")
        device2 = Device.objects.get(name="Device 2")
        device3 = Device.objects.get(name="Device 3")
        device4 = Device.objects.get(name="Device 4")

        data = {
            "front": [
                {
                    "id": device1.pk,
                    "x": 0,
                    "y": 42,
                    "is_full_depth": "True",
                    "face": "front",
                },
                {
                    "id": device2.pk,
                    "x": 0,
                    "y": 35,
                    "is_full_depth": "True",
                    "face": "front",
                },
                {
                    "id": device3.pk,
                    "x": 0,
                    "y": 1,
                    "is_full_depth": "False",
                    "face": "front",
                },
                {
                    "id": device4.pk,
                    "x": 0,
                    "y": 2,
                    "is_full_depth": "True",
                    "face": "front",
                },
            ],
            "rack_id": rack.pk,
            "rear": [],
            "other": [
                {
                    "id": device4.pk,
                    "x": 0,
                    "y": 2,
                    "is_full_depth": "True",
                    "face": None,
                }
            ],
        }

        resp = self.client.put(
            f"/api/plugins/reorder/save/{rack.pk}/",
            data,
            content_type="application/json",
        )
        self.assertHttpStatus(resp, 201)

        for num in [1, 2, 3, 4]:
            device = Device.objects.get(name=f"Device {num}")
            self.assertEqual(device.position, data["front"][num - 1]["y"])
            self.assertEqual(device.face, data["front"][num - 1]["face"])
