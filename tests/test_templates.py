import os
import pathlib
import re

import pytest
from html_checker.validator import ValidatorInterface

from tests import BASEDIR

allow = {
    (
        "An “img” element must have an “alt” attribute, except under certain conditions. "
        "For details, consult guidance on providing text alternatives for images."
    ),
    # HTML fragment.
    "Start tag seen without seeing a doctype first. Expected “<!DOCTYPE html>”.",
    "Consider adding a “lang” attribute to the “html” start tag to declare the language of this document.",
    "Element “head” is missing a required instance of child element “title”.",
    "End of file seen without seeing a doctype first. Expected “<!DOCTYPE html>”.",
    # Obsolete attributes.
    "The “align” attribute on the “table” element is obsolete. Use CSS instead.",
    "The “align” attribute on the “td” element is obsolete. Use CSS instead.",
    "The “bgcolor” attribute on the “td” element is obsolete. Use CSS instead.",
    "The “border” attribute on the “table” element is obsolete. Use CSS instead.",
    "The “cellpadding” attribute on the “table” element is obsolete. Use CSS instead.",
    "The “cellspacing” attribute on the “table” element is obsolete. Use CSS instead.",
    "The “valign” attribute on the “td” element is obsolete. Use CSS instead.",
    "The “width” attribute on the “table” element is obsolete. Use CSS instead.",
    "The “width” attribute on the “td” element is obsolete. Use CSS instead.",
}


@pytest.mark.skipif("CI" not in os.environ, reason="skipping slow test in development")
def test_valid_html(tmp_path):
    for file in (pathlib.Path(BASEDIR).parent / "email_templates").glob("*"):
        (tmp_path / file.name).write_text(re.sub(r"{{[^}]+}}", "http://host", file.read_text()))

    for path, report in ValidatorInterface().validate([str(path) for path in tmp_path.glob("*")]).registry.items():
        assert [f"{m['message']} ({m['extract']})" for m in report if m["message"] not in allow] == [], path
