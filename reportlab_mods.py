"""reportlab/__init__.py runs ``import reportlab_mods`` (this file)."""

from pathlib import Path
from typing import Any

from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Table, TableStyle

fontsdir = Path(__file__).parent / "fonts"

pdfmetrics.registerFont(TTFont("GTEestiProDisplay", fontsdir / "GTEestiProDisplay-Regular.ttf"))
pdfmetrics.registerFont(TTFont("GTEestiProDisplayBd", fontsdir / "GTEestiProDisplay-Bold.ttf"))
pdfmetrics.registerFont(TTFont("GTEestiProDisplayIt", fontsdir / "GTEestiProDisplay-RegularItalic.ttf"))
pdfmetrics.registerFont(TTFont("GTEestiProDisplayBI", fontsdir / "GTEestiProDisplay-BoldItalic.ttf"))
pdfmetrics.registerFontFamily(
    "GTEestiProDisplay",
    normal="GTEestiProDisplay",
    bold="GTEestiProDisplayBd",
    italic="GTEestiProDisplayIt",
    boldItalic="GTEestiProDisplayBI",
)

width, height = A4
styles = getSampleStyleSheet()  # type: ignore[no-untyped-call]
styleN = styles["BodyText"]  # noqa: N816
styleN.fontName = "GTEestiProDisplay"
styleN.alignment = TA_LEFT
styleBH = styles["Normal"]  # noqa: N816
styleBH.fontName = "GTEestiProDisplay"
styleBH.alignment = TA_CENTER

styleTitle = styles["Title"]  # noqa: N816
styleTitle.fontName = "GTEestiProDisplay"

styleSubTitle = styles["Heading2"]  # noqa: N816
styleSubTitle.fontName = "GTEestiProDisplay"


def create_table(data: Any) -> Table:
    table = Table(data, colWidths=[250, 350])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), "#D6E100"),
                ("TEXTCOLOR", (0, 0), (-1, 0), "#444444"),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "GTEestiProDisplay"),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                ("BACKGROUND", (0, 1), (-1, -1), "#F2F2F2"),
                ("FONTNAME", (0, 0), (-1, -1), "GTEestiProDisplay"),
                ("ALIGN", (0, 0), (-1, 0), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("WORDWRAP", (0, 0), (-1, -1)),
            ]
        )
    )

    return table
