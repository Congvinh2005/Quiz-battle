"""
Insert test data vào database Quiz Battle
Run: python insert_test_data.py
"""
import os
import sys
from sqlalchemy import create_engine, text
from datetime import datetime
import uuid

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from app.core.config import settings

def insert_test_data():
    """Insert dữ liệu test vào database"""
    
    try:
        engine = create_engine(settings.DATABASE_URL)
        
        with engine.connect() as conn:
            # Get anthai's user_id
            result = conn.execute(text("SELECT id FROM users WHERE username = 'anthai' LIMIT 1"))
            user_row = result.fetchone()
            if not user_row:
                print("❌ User 'anthai' không tồn tại. Vui lòng đăng ký tài khoản trước.")
                return
            
            user_id = user_row[0]
            print(f"✅ Tìm được user anthai: {user_id}")
            
            # 1. Insert Quiz
            quiz_id = str(uuid.uuid4())
            conn.execute(text("""
                INSERT INTO quizzes (id, user_id, title, description, is_public, created_at, updated_at)
                VALUES (:id, :user_id, :title, :description, :is_public, :created_at, :updated_at)
                ON CONFLICT DO NOTHING
            """), {
                'id': quiz_id,
                'user_id': user_id,
                'title': 'Top 10 Câu Hỏi Lập Trình Python',
                'description': 'Quiz kiểm tra kiến thức Python cơ bản và nâng cao',
                'is_public': True,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            })
            print(f"✅ Inserted quiz: {quiz_id}")
            
            # 2. Insert Questions
            questions_data = [
                ('Python là ngôn ngữ gì?', 'MCQ'),
                ('Hàm nào dùng để in ra console?', 'MCQ'),
                ('Kiểu dữ liệu nào là immutable?', 'MCQ'),
                ('Để tạo dictionary trong Python, cú pháp nào đúng?', 'MCQ'),
            ]
            
            question_ids = []
            for question_text, q_type in questions_data:
                q_id = str(uuid.uuid4())
                question_ids.append(q_id)
                conn.execute(text("""
                    INSERT INTO questions (id, quiz_id, question_text, question_type, time_limit, points, created_at, updated_at)
                    VALUES (:id, :quiz_id, :question_text, :question_type, :time_limit, :points, :created_at, :updated_at)
                    ON CONFLICT DO NOTHING
                """), {
                    'id': q_id,
                    'quiz_id': quiz_id,
                    'question_text': question_text,
                    'question_type': q_type,
                    'time_limit': 30,
                    'points': 10,
                    'created_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                })
            print(f"✅ Inserted {len(question_ids)} questions")
            
            # 3. Insert Answer Options
            answers_config = [
                # Q1: Python là ngôn ngữ gì?
                {
                    'q_index': 0,
                    'options': [
                        ('Ngôn ngữ lập trình bậc cao, diễn dịch', True),
                        ('Ngôn ngữ máy', False),
                        ('Ngôn ngữ tập lệnh shell', False),
                    ]
                },
                # Q2: Hàm nào dùng để in ra console?
                {
                    'q_index': 1,
                    'options': [
                        ('print()', True),
                        ('echo()', False),
                        ('log()', False),
                    ]
                },
                # Q3: Kiểu dữ liệu nào là immutable?
                {
                    'q_index': 2,
                    'options': [
                        ('Tuple', True),
                        ('List', False),
                        ('Dictionary', False),
                    ]
                },
                # Q4: Cú pháp tạo dictionary
                {
                    'q_index': 3,
                    'options': [
                        ('my_dict = {"key": "value"}', True),
                        ('my_dict = ["key", "value"]', False),
                        ('my_dict = ("key", "value")', False),
                    ]
                },
            ]
            
            for config in answers_config:
                q_id = question_ids[config['q_index']]
                for option_text, is_correct in config['options']:
                    opt_id = str(uuid.uuid4())
                    conn.execute(text("""
                        INSERT INTO answer_options (id, question_id, option_text, is_correct, created_at, updated_at)
                        VALUES (:id, :question_id, :option_text, :is_correct, :created_at, :updated_at)
                        ON CONFLICT DO NOTHING
                    """), {
                        'id': opt_id,
                        'question_id': q_id,
                        'option_text': option_text,
                        'is_correct': is_correct,
                        'created_at': datetime.utcnow(),
                        'updated_at': datetime.utcnow()
                    })
            print(f"✅ Inserted answer options")
            
            # 4. Insert Game Room
            room_id = str(uuid.uuid4())
            conn.execute(text("""
                INSERT INTO game_rooms (
                    id, room_code, host_id, quiz_id, status, 
                    max_players, shuffle_questions, chat_enabled, current_question_order,
                    created_at, updated_at
                )
                VALUES (
                    :id, :room_code, :host_id, :quiz_id, :status,
                    :max_players, :shuffle_questions, :chat_enabled, :current_question_order,
                    :created_at, :updated_at
                )
                ON CONFLICT (room_code) DO NOTHING
            """), {
                'id': room_id,
                'room_code': 'TEST01',
                'host_id': user_id,
                'quiz_id': quiz_id,
                'status': 'WAITING',
                'max_players': 30,
                'shuffle_questions': True,
                'chat_enabled': True,
                'current_question_order': 1,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            })
            print(f"✅ Inserted game room: TEST01 ({room_id})")
            
            # 5. Insert Room Players
            player_id = str(uuid.uuid4())
            conn.execute(text("""
                INSERT INTO room_players (
                    id, room_id, user_id, display_name, score,
                    created_at, updated_at
                )
                VALUES (
                    :id, :room_id, :user_id, :display_name, :score,
                    :created_at, :updated_at
                )
                ON CONFLICT (room_id, user_id) DO NOTHING
            """), {
                'id': player_id,
                'room_id': room_id,
                'user_id': user_id,
                'display_name': 'anthai (Host)',
                'score': 0,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            })
            print(f"✅ Inserted room player")
            
            # Commit
            conn.commit()
            
            # Verify
            print("\n" + "="*50)
            print("📊 VERIFICATION:")
            print("="*50)
            
            quizzes = conn.execute(text("SELECT COUNT(*) FROM quizzes WHERE title = 'Top 10 Câu Hỏi Lập Trình Python'")).scalar()
            questions = conn.execute(text(f"SELECT COUNT(*) FROM questions WHERE quiz_id = '{quiz_id}'")).scalar()
            options = conn.execute(text(f"SELECT COUNT(*) FROM answer_options WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = '{quiz_id}')")).scalar()
            rooms = conn.execute(text("SELECT COUNT(*) FROM game_rooms WHERE room_code = 'TEST01'")).scalar()
            players = conn.execute(text(f"SELECT COUNT(*) FROM room_players WHERE room_id = '{room_id}'")).scalar()
            
            print(f"✅ Quizzes: {quizzes}")
            print(f"✅ Questions: {questions}")
            print(f"✅ Answer Options: {options}")
            print(f"✅ Game Rooms: {rooms}")
            print(f"✅ Room Players: {players}")
            
            print("\n" + "="*50)
            print("🎉 TEST DATA INSERTED SUCCESSFULLY!")
            print("="*50)
            print(f"\n📝 Test Details:")
            print(f"  - Quiz: Top 10 Câu Hỏi Lập Trình Python")
            print(f"  - Room Code: TEST01")
            print(f"  - Host: anthai")
            print(f"  - Max Players: 30")
            print(f"  - Shuffle: Yes")
            print(f"  - Chat: Yes\n")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    insert_test_data()
