Contributing
============

.. toctree::
   :caption: contents

   style
   api
   sqlalchemy

.. seealso::

   `ADRs for models.py and sources/colombia.py <https://drive.google.com/drive/folders/1WtrwJH3kSQNxt9K-sa1s4O8HbwkLzcEA>`__

Setup
-----

#. Install the requirements:

   .. code-block:: bash

      pip install -r requirements_dev.txt -r docs/requirements.txt sphinx-autobuild

   .. note::

      If requirements are updated in git, re-run this command.

#. Set up the git pre-commit hook:

   .. code-block:: bash

      pre-commit install

#. Compile message catalogs:

   .. code-block:: bash

      pybabel compile -f -d locale

#. Create development and test databases. To use the default ``DATABASE_URL``, create a database named ``credere_backend`` to which your shell user has access.

   To customize settings (for example, to use a different ``DATABASE_URL``), create a ``.env`` file based on the ``.env.example`` file.

   Set ``AWS_*`` and ``COGNITO_*`` to be able to login and test the application.

#. Run database migrations:

   .. code-block:: bash

      alembic upgrade head

#. :ref:`cognito-admin` in the Cognito user pool for development.

Repository structure
--------------------

.. tree app/ -I '__pycache__'

.. code-block:: none

   email_templates/         # HTML fragments
   app/
   ├── __init__.py
   ├── __main__.py          # Typer commands
   ├── auth.py              # Permissions and JWT token verification
   ├── aws.py               # Amazon Web Services API clients
   ├── db.py                # SQLAlchemy database operations and session management
   ├── dependencies.py      # FastAPI dependencies
   ├── exceptions.py        # Definitions of exceptions raised by this application
   ├── i18n.py              # Internationalization support
   ├── mail.py              # Email sending
   ├── main.py              # FastAPI application entry point
   ├── models.py            # SQLAlchemy models
   ├── parsers.py           # Pydantic models to parse query strings and request bodies
   ├── routers              # FastAPI routers
   │   ├── __init__.py
   │   ├── guest            # FastAPI routers for passwordless URLs
   │   │   └── {...}.py
   │   └── {...}.py
   ├── serializers.py       # Pydantic models to serialize API responses
   ├── settings.py          # Environment settings and Sentry configuration
   ├── sources              # Data sources for contracts, awards, and borrowers
   │   ├── __init__.py
   │   └── colombia.py
   ├── util.py              # Utilities used by routers, background tasks and commands
   └── utils
       ├── __init__.py
       ├── statistics.py    # Statistics functions used by statistics routers, background tasks and commands
       └── tables.py        # Functions for generating tables in downloadable documents

Run commands
------------

.. _dev-server:

Run server
~~~~~~~~~~

.. code-block:: bash

   uvicorn app.main:app --reload

.. _dev-tests:

Run tests
~~~~~~~~~

The :attr:`DATABASE_URL<app.settings.Settings.database_url>` and :attr:`TEST_DATABASE_URL<app.settings.Settings.test_database_url>` environment variables must be set to the test database.

.. code-block:: bash

   coverage run --source=app -m pytest

Generate coverage HTML report:

.. code-block:: bash

   coverage html

You can the open ``htmlcov/index.html`` in a browser.

Run shell
~~~~~~~~~

For example:

.. code-block:: python

   from sqlalchemy import create_engine
   from sqlalchemy.orm import Session
   from sqlmodel import col
   from app import models
   engine = create_engine("postgresql+psycopg:///credere", echo=True)
   session = Session(engine)

And then run queries with ``session``.

Build documentation
~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   sphinx-autobuild -q docs docs/_build/html --watch .

Run application as Docker
~~~~~~~~~~~~~~~~~~~~~~~~~

Create an image:

.. code-block:: bash

   docker build -t {image_name} .

Create and run a container:

.. code-block:: bash

   docker run -d --name {container_name} -p 8000:8000 {image_name}

To delete the image (e.g. when recreating it), run:

.. code-block:: bash

   docker rmi {image_id}

Make changes
------------

Read the next pages in this section to learn about style guides, and the :doc:`../api/index` about helper methods and application logic. Read the `OCP Software Development Handbook <https://ocp-software-handbook.readthedocs.io/en/latest/>`__: in particular, `Python <https://ocp-software-handbook.readthedocs.io/en/latest/python/>`__.

.. seealso:: `Parsing error responses and catching exceptions from AWS services <https://boto3.amazonaws.com/v1/documentation/api/latest/guide/error-handling.html#parsing-error-responses-and-catching-exceptions-from-aws-services>`__

Update requirements
~~~~~~~~~~~~~~~~~~~

See `Requirements <https://ocp-software-handbook.readthedocs.io/en/latest/python/requirements.html>`__ in the OCP Software Development Handbook.

Update translations
~~~~~~~~~~~~~~~~~~~

#. Update the message catalogs:

   .. code-block:: bash

      pybabel extract -k '_ i' -o messages.pot app
      pybabel update -N -i messages.pot -d locale

#. Compile the message catalogs (in development):

   .. code-block:: bash

      pybabel compile -f -d locale

.. note::

   Some messags are extracted from ``StrEnum`` classes. If Credere is deployed in English, we need to add an ``en`` locale to translate these. Otherwise, the translations will be database values like "MICRO", not "0 to 10".

Update API
~~~~~~~~~~

After making changes, regenerate the OpenAPI document by :ref:`running the server<dev-server>` and:

.. code-block:: bash

   curl http://localhost:8000/openapi.json -o docs/_static/openapi.json

Update models
~~~~~~~~~~~~~

Check whether a migration is needed:

.. code-block:: bash

   alembic check

If so, either auto-detect the changes made to ``models.py``, subject to `limitations <https://alembic.sqlalchemy.org/en/latest/autogenerate.html#what-does-autogenerate-detect-and-what-does-it-not-detect>`__:

.. code-block:: bash

   alembic revision --autogenerate -m "migration name"

Or, create a blank migration file:

.. code-block:: bash

   alembic revision -m "migration name"

Both generate a file like ``migrations/versions/2ca870aa737d_migration_name.py``. Edit the ``upgrade`` and ``downgrade`` functions, as needed.

.. tip::

   Need to undo your migration in development? Find the previous revision:

   .. code-block:: bash

      alembic history

   And revert, for example:

   .. code-block:: bash

      alembic downgrade 20e0ff589a61

Then, `update <https://ocp-software-handbook.readthedocs.io/en/latest/services/postgresql.html#generate-entity-relationship-diagram>`__ the :ref:`erd`. For example:

.. code-block:: bash

   java -jar schemaspy.jar -t pgsql -dp postgresql.jar -o schemaspy -norows -I '(django|auth).*' -host localhost -db credere_backend -u MYUSER
   mv schemaspy/diagrams/orphans/orphans.png docs/_static/
   mv schemaspy/diagrams/summary/relationships.real.large.png docs/_static/

Update email templates
~~~~~~~~~~~~~~~~~~~~~~

.. note:: This section is a stub.

-  `Premailer <https://premailer.dialect.ca>`__

.. _state-machine:

Application status transitions
------------------------------

.. image:: /_static/state-machine.png
   :target: ../_images/state-machine.png

..
   https://play.d2lang.com
   https://pincel.app/tools/svg-to-png
   α -> PENDING: Credere sends an invitation to the borrower
   PENDING -> LAPSED: borrower doesn't\naccept or decline the invitation
   PENDING -> DECLINED: borrower declines the invitation
   PENDING -> ACCEPTED: borrower accepts the invitation
   ACCEPTED -> LAPSED: borrower doesn't\nsubmit the application
   ACCEPTED -> SUBMITTED: borrower submits the application
   SUBMITTED -> LAPSED: borrower doesn't\nstart external onboarding {class: external}
   SUBMITTED -> STARTED: lender starts application review
   STARTED -> INFORMATION_REQUESTED: lender requests\nthe borrower to update a document {class: native}
   STARTED -> REJECTED: lender rejects the application
   STARTED -> APPROVED: lender approves the application
   STARTED -> LAPSED: lender lapses the application if the borrower\nis unresponsive to external messages
   INFORMATION_REQUESTED -> LAPSED: borrower doesn't\nsubmit the information requested {class: native}
   INFORMATION_REQUESTED -> STARTED: borrower updates the document {class: native}
   classes: {
     native.style.stroke: maroon
     external.style.stroke: red
   }

.. _erd:

Entity relationship diagram
---------------------------

.. image:: /_static/relationships.real.large.png
   :target: ../_images/relationships.real.large.png

.. image:: /_static/orphans.png
   :target: ../_images/orphans.png
