"""Preserve game_results when game_rooms are deleted

Revision ID: 006_preserve_game_results_on_room_delete
Revises: 005_add_current_question_order
Create Date: 2026-05-11 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '006_preserve_game_results_on_room_delete'
down_revision = '005_add_current_question_order'
branch_labels = None
depends_on = None


def upgrade():
    # Drop the old foreign key constraint with CASCADE
    op.drop_constraint('game_results_room_id_fkey', 'game_results', type_='foreignkey')
    
    # Create new foreign key constraint without CASCADE
    op.create_foreign_key(
        'game_results_room_id_fkey',
        'game_results',
        'game_rooms',
        ['room_id'],
        ['id']
    )


def downgrade():
    # Drop the new foreign key constraint
    op.drop_constraint('game_results_room_id_fkey', 'game_results', type_='foreignkey')
    
    # Recreate the old foreign key constraint with CASCADE
    op.execute(
        'ALTER TABLE game_results ADD CONSTRAINT game_results_room_id_fkey '
        'FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE'
    )
