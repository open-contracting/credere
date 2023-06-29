"""add_confirmation_email_token_to_application

Revision ID: e83a0d6c0f86
Revises: df236486f60a
Create Date: 2023-06-27 11:43:24.186692

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "e83a0d6c0f86"
down_revision = "df236486f60a"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = inspector.get_columns("application")

    for column in columns:
        if column["name"] == "confirmation_email_token":
            break

    op.add_column(
        "application",
        sa.Column("confirmation_email_token", sa.String(), nullable=True, default=""),
    )

    op.create_unique_constraint(
        "uq_application_confirmation_email_token",
        "application",
        ["confirmation_email_token"],
    )

    with op.get_context().autocommit_block():
        op.execute(
            """
          ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'EMAIL_CHANGE_CONFIRMATION'
      """
        )


def downgrade() -> None:
    op.drop_column("application", "confirmation_email_token")
