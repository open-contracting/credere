:hide-toc:

Frontend
========

Environment variables
---------------------

As the build system is Vite, the variables name should start with **VITE\_**

For VS Code Intellisense to recognize the new variables, declare them in the file ``src/vite-env.d.ts``

Commands
--------

Run development server:

.. code:: bash

   pnpm exec vite

Build production files into ``dist`` directory:

.. code:: bash

   pnpm exec tsc && pnpm exec vite build

Run server from the ``dist`` directory:

.. code:: bash

   pnpm exec vite preview

Run a Storybook locally:

.. code:: bash

   pnpm exec storybook dev

Build static app with a `Storybook’s content <https://storybook.js.org/docs/react/sharing/publish-storybook>`__:

.. code:: bash

   pnpm exec storybook build

Backend integration
-------------------

Enumerations
~~~~~~~~~~~~

Credere frontend's ``src/constants/index.ts`` constants should match ``app.models`` enumerations.

.. list-table::
   :header-rows: 1

   * - Backend
     - Frontend
   * - ApplicationStatus
     - APPLICATION_STATUS
   * - BorrowerSize.NOT_INFORMED
     - DEFAULT_BORROWER_SIZE
   * - CreditType
     - CREDIT_PRODUCT_TYPE
   * - UserType
     - USER_TYPES

… and also ``app.util`` enumerations.

.. list-table::
   :header-rows: 1

   * - Backend
     - Frontend
   * - StatisticCustomRange
     - STATISTICS_DATE_FILTER

Schemas and models
~~~~~~~~~~~~~~~~~~

Credere frontend's ``src/schemas/`` schemas should match ``app.parsers``,  ``app.serializers`` and  ``app.models`` models.

This table is contructed by running this command, and filling in information from Credere frontend's ``src/api/`` files:

.. code-block:: bash

   uv run python -m app dev routes --csv-format --file docs/_static/routes.csv

.. csv-table::
   :file: _static/routes.csv
   :header-rows: 1
   :class: datatable
