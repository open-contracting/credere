from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.i18n import _
from app.routers import applications, downloads, guest, lenders, statistics, users
from app.settings import app_settings


async def http_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse({"detail": _("An unexpected error occurred")}, status_code=500)


app = FastAPI(exception_handlers={500: http_exception_handler})

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", app_settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(applications.router)
app.include_router(guest.applications.router)
app.include_router(guest.emails.router)
app.include_router(guest.meta.router)
app.include_router(downloads.router)
app.include_router(lenders.router)
app.include_router(statistics.router)
