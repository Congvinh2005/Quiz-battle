"""Add wins field to user_stats table

Revision ID: 004_add_wins_to_user_stats
Revises: 003_initial_schema
Create Date: 2026-05-11 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004_add_wins_to_user_stats'
down_revision = '003_initial_schema'
branch_labels = None
depends_on = None


def upgrade():
    # Add wins column to user_stats table
    op.add_column('user_stats', sa.Column('wins', sa.Integer(), nullable=False, server_default='0'))


def downgrade():
    # Remove wins column from user_stats table
    op.drop_column('user_stats', 'wins')
