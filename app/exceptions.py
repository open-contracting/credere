from typing import Any


class CredereError(Exception):
    """Base class for exceptions from within this application."""


class SourceFormatError(CredereError):
    """Raised if the response format of the data source has changed."""


class SkippedAwardError(CredereError):
    """
    Raised if an award needs to be skipped due to a data quality issue.

    Use only with :func:`app.db.handle_skipped_award`
    """

    def __init__(self, message: str, url: str = "", data: Any = None):
        self.category = "SKIPPED_AWARD"
        self.message = message
        self.url = url
        if data is None:
            self.data = {}
        else:
            self.data = data
