from dcim.svg.racks import get_device_name
from django import template
from utilities.html import foreground_color

register = template.Library()


@register.filter()
def rack_unit(value):
    if value % 1 == 0:
        return True
    else:
        return False


@register.filter()
def rack_unit_to_int(value):
    return int(value)


@register.filter()
def calculate_u_position(unit, rack):
    """
    Return the grid row a device starts on, counting rows of half a rack unit.

    The grid is two rows per rack unit, so a device 1.5U tall spans three rows and one 0.5U
    tall spans one.
    """
    u_height = rack.u_height * 2
    height = int(unit.get("height", 1) * 2)
    unit_id = int(unit["id"] * 2)

    if rack.desc_units:
        return unit_id - 2

    # Rows are numbered from the top of the rack, so the row depends on the device's topmost
    # unit rather than the position it is mounted at. This holds for fractional heights too:
    # the special case this replaced applied only to devices one row tall, and placed 0.5U
    # devices a row above where they belong.
    return u_height - unit_id - height + 2


@register.filter()
def mul(value, mul_value):
    """
    Multiply, then truncate — not the other way round.

    Truncating first discarded the fractional part of a device's height, collapsing 1.5U to
    1U and 0.5U to nothing at all (issues #25 and #35).
    """
    return int(value * mul_value)


@register.filter()
def text_color(value):
    return foreground_color(value)


@register.filter()
def device_name(device):
    return get_device_name(device)
