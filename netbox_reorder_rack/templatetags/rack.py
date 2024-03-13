from django import template
from utilities.utils import foreground_color

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
    u_height = rack.u_height * 2
    height = int(unit.get("height", 1) * 2)
    unit_id = int(unit["id"] * 2)

    if rack.desc_units:
        return unit_id - 2
    else:
        if height > 1:
            return u_height - unit_id - height + 2
        else:
            return u_height - unit_id


@register.filter()
def mul(value, mul_value):
    return int(value) * mul_value


@register.filter()
def text_color(value):
    return foreground_color(value)
