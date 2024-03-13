from dcim.models import Device
from dcim.models import DeviceRole
from dcim.models import DeviceType
from dcim.models import Manufacturer
from dcim.models import Rack
from dcim.models import Site
from django.contrib.contenttypes.models import ContentType
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
        ct = ContentType.objects.filter(model="device").first()
        obj_perm.object_types.add(ct)

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
