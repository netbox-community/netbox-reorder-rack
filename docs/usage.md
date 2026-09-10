# Reordering a Rack

Open any rack detail view and choose **Reorder**. The button appears for users with `dcim.change_device`.

## The Layout

The reorder view shows the rack's front and rear elevations side by side, with a **Non-Racked Devices** list beneath them. Every device belonging to the rack appears in exactly one of the three.

Unit numbers run down the side of each elevation, matching the rack's own orientation — a rack with descending units reads the same way here as it does elsewhere in NetBox.

## Moving Devices

Drag a device to a new position. What you can do:

| Action | Result |
|---|---|
| Drag within a face | Changes the device's position |
| Drag between front and rear | Changes both position and face |
| Drag into **Non-Racked Devices** | Clears the position and face; the device stays in the rack |
| Drag out of **Non-Racked Devices** | Assigns a position and face |

Full-depth devices are mirrored onto the opposite face as they are placed, so a full-depth server dropped on the front also appears on the rear. The mirrored copy is drawn with a hatched background to show it is the reverse view of the same device, not a second device.

!!! note
    Devices are not resizable here. Height comes from the device type, so a 2U device stays 2U — you are choosing where it sits, not how large it is.

## Display Modes

The selector above the elevation controls what each device shows:

| Mode | Shows |
|---|---|
| **Images and Labels** | Device-type images with names overlaid (the default) |
| **Images only** | Device-type images alone |
| **Labels only** | Names alone, with no images |

This mirrors the equivalent NetBox setting and is useful when device-type images make a dense rack hard to read.

## Keyboard and Pointer

Dragging is pointer-driven. Devices can be nudged by dragging within their face; there is no keyboard shortcut for fine positioning.

Clicking a device navigates to it in NetBox, so a click is not a drag — press, move, then release to reposition.

## Saving

Nothing is written until you press **Save**, which stays disabled until you actually change something.

On save, each moved device is validated with NetBox's own model validation and written inside a single transaction:

* If nothing changed, the save reports that no changes were detected and writes nothing.
* If you lack permission on any device the save would move, the whole save is rejected — not partially applied.
* If any device would end up invalid — overlapping another device, or extending past the top of the rack — the transaction is rolled back and nothing is written.

A toast confirms the result. Each moved device is recorded in NetBox's change log individually, exactly as if it had been edited by hand.

!!! warning
    Navigating away without saving discards the arrangement. The rack is unchanged until **Save** succeeds.

## Troubleshooting

**Nothing can be dragged, and the elevation looks static.**
The JavaScript has not loaded. Run `python3 manage.py collectstatic --no-input` and restart NetBox — this is needed after every plugin upgrade, not only the first install. Check the browser console for a 404 on `netbox_reorder_rack/js/rack.js`.

**The Reorder button is missing.**
The button requires `dcim.change_device`.

**Save reports a permissions error.**
Both `dcim.view_device` and `dcim.change_device` are required, and object-level permissions are enforced per device. A single device you cannot change will block the whole save.

**A device will not drop where I want it.**
Something already occupies those units on that face, or the device would extend past the top of the rack. Move the occupant out first — to the non-racked list if necessary — then place both.
