import gettext
from pathlib import Path
from typing import Any

from app.settings import app_settings

localedir = Path(__file__).absolute().parent.parent / "locale"

translators = {
    path.name: gettext.translation("messages", localedir, languages=[path.name])
    for path in localedir.iterdir()
    if path.is_dir()
}


def _(message: str, language: str = app_settings.email_template_lang, **kwargs: Any) -> str:
    return translators[language].gettext(message) % kwargs
