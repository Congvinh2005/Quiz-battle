"""Add soft delete columns to quizzes

Revision ID: 010_add_soft_delete_to_quizzes
Revises: 009_add_user_full_name
Create Date: 2026-05-23 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '010_add_soft_delete_to_quizzes'
down_revision = '009_add_user_full_name'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('quizzes', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column('quizzes', sa.Column('deleted_at', sa.DateTime(), nullable=True))
    op.create_index(op.f('ix_quizzes_is_deleted'), 'quizzes', ['is_deleted'], unique=False)
    op.alter_column('quizzes', 'is_deleted', server_default=None)


def downgrade():
    op.drop_index(op.f('ix_quizzes_is_deleted'), table_name='quizzes')
    op.drop_column('quizzes', 'deleted_at')
    op.drop_column('quizzes', 'is_deleted')
