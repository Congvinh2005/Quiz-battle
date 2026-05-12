"""add_current_question_order

Revision ID: 005_add_current_question_order
Revises: 004_add_wins_to_user_stats
Create Date: 2026-05-11 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '005_add_current_question_order'
down_revision = '004_add_wins_to_user_stats'
branch_labels = None
depends_on = None


def upgrade():
    # Add current_question_order column to room_players table
    op.add_column('room_players', sa.Column('current_question_order', sa.Integer(), nullable=False, server_default='0'))


def downgrade():
    # Remove current_question_order column from room_players table
    op.drop_column('room_players', 'current_question_order')
