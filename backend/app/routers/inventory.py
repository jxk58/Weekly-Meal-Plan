from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse

from app.models import StorageLocation
from app.templating import templates

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("", response_class=HTMLResponse)
def inventory(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(
        request,
        "inventory/index.html",
        {"active": "inventory", "locations": list(StorageLocation)},
    )
