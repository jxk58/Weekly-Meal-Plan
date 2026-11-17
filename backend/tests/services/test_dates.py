from datetime import date

import pytest

from app.services.dates import week_dates, week_start


@pytest.mark.parametrize(
    "day",
    [date(2026, 11, 16), date(2026, 11, 18), date(2026, 11, 22)],
)
def test_week_start_is_monday(day: date) -> None:
    assert week_start(day) == date(2026, 11, 16)


def test_week_dates_spans_monday_to_sunday() -> None:
    days = week_dates(date(2026, 11, 19))
    assert len(days) == 7
    assert days[0] == date(2026, 11, 16)
    assert days[-1] == date(2026, 11, 22)


def test_week_crosses_year_boundary() -> None:
    assert week_start(date(2027, 1, 1)) == date(2026, 12, 28)
