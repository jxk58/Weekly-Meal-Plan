"""Week calculations. Weeks run Monday through Sunday."""

from datetime import date, timedelta


def week_start(day: date) -> date:
    """Return the Monday of the week containing ``day``."""
    return day - timedelta(days=day.weekday())


def week_dates(day: date) -> list[date]:
    """Return the seven dates (Monday to Sunday) of the week containing ``day``."""
    start = week_start(day)
    return [start + timedelta(days=offset) for offset in range(7)]
