"""Add avatar_url to users

Revision ID: 008_add_user_avatar_url
Revises: 007_add_kicked_players_table
Create Date: 2026-05-18 22:50:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '008_add_user_avatar_url'
down_revision = '007_add_kicked_players_table'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('avatar_url', sa.Text(), nullable=True))


def downgrade():
    op.drop_column('users', 'avatar_url')
