"""Add full_name to users

Revision ID: 009_add_user_full_name
Revises: 008_add_user_avatar_url
Create Date: 2026-05-18 23:05:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '009_add_user_full_name'
down_revision = '008_add_user_avatar_url'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('full_name', sa.String(length=255), nullable=True))


def downgrade():
    op.drop_column('users', 'full_name')
