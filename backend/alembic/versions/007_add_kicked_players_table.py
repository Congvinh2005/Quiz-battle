"""Add kicked_players table to track kicked players

Revision ID: 007_add_kicked_players_table
Revises: 006_preserve_game_results_on_room_delete
Create Date: 2026-05-16 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '007_add_kicked_players_table'
down_revision = '006_preserve_game_results_on_room_delete'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'kicked_players',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('room_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('kicked_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['room_id'], ['game_rooms.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('room_id', 'user_id', name='uq_kicked_room_user')
    )
    op.create_index(op.f('ix_kicked_players_room_id'), 'kicked_players', ['room_id'], unique=False)
    op.create_index(op.f('ix_kicked_players_user_id'), 'kicked_players', ['user_id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_kicked_players_user_id'), table_name='kicked_players')
    op.drop_index(op.f('ix_kicked_players_room_id'), table_name='kicked_players')
    op.drop_table('kicked_players')
