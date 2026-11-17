import pytest
from fastapi.testclient import TestClient


def test_healthz(client: TestClient) -> None:
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.parametrize(
    ("path", "heading"),
    [
        ("/", "This week"),
        ("/meals", "Week of"),
        ("/inventory", "Inventory"),
        ("/grocery", "Grocery list"),
    ],
)
def test_pages_render_with_nav(client: TestClient, path: str, heading: str) -> None:
    response = client.get(path)
    assert response.status_code == 200
    assert heading in response.text
    assert 'aria-current="page"' in response.text


def test_meals_week_navigation(client: TestClient) -> None:
    # 2026-11-18 is a Wednesday; the page should show the week starting Monday 2026-11-16.
    response = client.get("/meals", params={"week": "2026-11-18"})
    assert response.status_code == 200
    assert "Week of Nov 16, 2026" in response.text
    assert "week=2026-11-09" in response.text
    assert "week=2026-11-23" in response.text


def test_meals_rejects_invalid_week(client: TestClient) -> None:
    assert client.get("/meals", params={"week": "not-a-date"}).status_code == 422


def test_static_css_served(client: TestClient) -> None:
    response = client.get("/static/css/app.css")
    assert response.status_code == 200
    assert "text/css" in response.headers["content-type"]
