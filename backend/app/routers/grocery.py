from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse

from app.templating import templates

router = APIRouter(prefix="/grocery", tags=["grocery"])


@router.get("", response_class=HTMLResponse)
def grocery_list(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(request, "grocery/index.html", {"active": "grocery"})
