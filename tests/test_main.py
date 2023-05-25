import httpx
from fastapi.testclient import TestClient

from app.main import app

VERSION: str = "0.1.0"


def test_info_endpoint():
    client = TestClient(app)
    response = client.get("/info")
    assert response.status_code == 200
    assert response.json() == {"Title": "Credence backend", "version": VERSION}


with httpx.Client() as client:
    response = client.get("https://www.google.com/")
    assert response.status_code == 200
