"""Add email login OTPs

Revision ID: 011_add_email_login_otps
Revises: 010_add_soft_delete_to_quizzes
Create Date: 2026-05-26 23:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = '011_add_email_login_otps'
down_revision = '010_add_soft_delete_to_quizzes'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'email_login_otps',
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('code_hash', sa.Text(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('consumed_at', sa.DateTime(), nullable=True),
        sa.Column('attempts', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_email_login_otps_email'), 'email_login_otps', ['email'], unique=False)
    op.create_index(op.f('ix_email_login_otps_expires_at'), 'email_login_otps', ['expires_at'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_email_login_otps_expires_at'), table_name='email_login_otps')
    op.drop_index(op.f('ix_email_login_otps_email'), table_name='email_login_otps')
    op.drop_table('email_login_otps')
