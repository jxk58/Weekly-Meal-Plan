from datetime import date, timedelta

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse

from app.models import MealType
from app.services.dates import week_dates
from app.templating import templates

router = APIRouter(prefix="/meals", tags=["meals"])


@router.get("", response_class=HTMLResponse)
def meal_plan(request: Request, week: date | None = None) -> HTMLResponse:
    days = week_dates(week or date.today())
    return templates.TemplateResponse(
        request,
        "meals/index.html",
        {
            "active": "meals",
            "days": days,
            "meal_types": list(MealType),
            "prev_week": days[0] - timedelta(days=7),
            "next_week": days[0] + timedelta(days=7),
        },
    )
