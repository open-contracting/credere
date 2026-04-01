# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

import sys
from pathlib import Path

from sqlalchemy.sql.expression import ColumnElement

sys.path.insert(0, str(Path(__file__).parent.parent))

# SQLModel with table=True generates __init__ with Column defaults. Sphinx autodoc's stringify_signature() triggers
# ColumnElement.__bool__(), which raises TypeError("Boolean value of this clause is not defined").
ColumnElement.__bool__ = lambda _: True  # type: ignore[method-assign,assignment]

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = "Credere"
copyright = "2023, Open Contracting Partnership"
author = "Open Contracting Partnership"

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = [
    "sphinx.ext.autodoc",
    "sphinx.ext.extlinks",
    "sphinx.ext.viewcode",
    "sphinx_design",
    "sphinxcontrib.typer",
]

templates_path = ["_templates"]
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]

# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = "furo"
html_static_path = ["_static"]
html_additional_pages = {
    "api/redoc": "redoc.html",
    "api/swagger-ui": "swagger-ui.html",
}
html_css_files = [
    "https://cdn.datatables.net/v/dt/jq-3.7.0/dt-2.1.4/cr-2.0.4/fc-5.0.1/fh-4.0.1/datatables.min.css",
    "custom.css",
]
html_js_files = [
    "https://cdn.datatables.net/v/dt/jq-3.7.0/dt-2.1.4/cr-2.0.4/fc-5.0.1/fh-4.0.1/datatables.min.js",
    "custom.js",
]

# -- Extension configuration -------------------------------------------------

# "more than one target found for cross-reference 'type'"
suppress_warnings = ["ref.python"]

autodoc_default_options = {
    "members": None,
    "member-order": "bysource",
    "exclude-members": "model_computed_fields,model_config,model_fields",
}
# Do not set autodoc_typehints = "description", to avoid repetition of parameters and types.

extlinks = {
    "issue": ("https://github.com/open-contracting/credere-backend/issues/%s", "#%s"),
}
