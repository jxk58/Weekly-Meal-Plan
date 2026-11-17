"""Application factory and ASGI entrypoint."""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.config import STATIC_DIR, get_settings
from app.routers import dashboard, grocery, health, inventory, meals


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, debug=settings.debug, docs_url=None, redoc_url=None)

    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

    app.include_router(health.router)
    app.include_router(dashboard.router)
    app.include_router(meals.router)
    app.include_router(inventory.router)
    app.include_router(grocery.router)

    return app


app = create_app()
