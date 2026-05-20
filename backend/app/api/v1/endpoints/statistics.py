from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.game.game_results import GameResult
from app.models.game.player_answers import PlayerAnswer
from app.models.user_stat.user_stats import UserStats


router = APIRouter(prefix="/statistics", tags=["statistics"])


@router.get("/me", response_model=dict)
def get_my_statistics(current_user: UUID = Depends(get_current_user), db: Session = Depends(get_db)):
    stats = db.query(UserStats).filter(UserStats.user_id == current_user).first()
    results = (
        db.query(GameResult)
        .filter(GameResult.user_id == current_user)
        .order_by(GameResult.created_at.desc())
        .all()
    )

    played_quizzes = []
    for result in results:
        room = result.room
        quiz = room.quiz if room else None
        answers = (
            db.query(PlayerAnswer)
            .filter(
                PlayerAnswer.room_id == result.room_id,
                PlayerAnswer.user_id == current_user,
            )
            .all()
        )
        correct_count = sum(1 for answer in answers if answer.is_correct)

        played_quizzes.append(
            {
                "result_id": str(result.id),
                "room_id": str(result.room_id),
                "room_code": room.room_code if room else None,
                "quiz_id": str(quiz.id) if quiz else None,
                "quiz_title": quiz.title if quiz else "Quiz không còn tồn tại",
                "final_score": result.final_score or 0,
                "rank": result.rank,
                "played_at": result.created_at.isoformat() if result.created_at else None,
                "started_at": room.started_at.isoformat() if room and room.started_at else None,
                "ended_at": room.ended_at.isoformat() if room and room.ended_at else None,
                "correct_count": correct_count,
                "answer_count": len(answers),
                "answers": [
                    {
                        "id": str(answer.id),
                        "question_id": str(answer.question_id),
                        "question": answer.question.content if answer.question else "Câu hỏi không còn tồn tại",
                        "question_type": answer.question.question_type if answer.question else None,
                        "time_limit": answer.question.time_limit if answer.question else None,
                        "selected_option_id": str(answer.selected_option_id) if answer.selected_option_id else None,
                        "selected_option": answer.selected_option.content if answer.selected_option else None,
                        "correct_option": next(
                            (
                                option.content
                                for option in (answer.question.answer_options if answer.question else [])
                                if option.is_correct
                            ),
                            None,
                        ),
                        "options": [
                            {
                                "id": str(option.id),
                                "content": option.content,
                                "is_correct": bool(option.is_correct),
                            }
                            for option in (answer.question.answer_options if answer.question else [])
                        ],
                        "is_correct": bool(answer.is_correct),
                        "response_time": answer.response_time,
                    }
                    for answer in answers
                ],
            }
        )

    return {
        "summary": {
            "total_games": stats.total_games if stats else len(results),
            "total_score": stats.total_score if stats else sum(result.final_score or 0 for result in results),
            "avg_score": stats.avg_score if stats else 0,
            "wins": getattr(stats, "wins", 0) if stats else 0,
            "played_quiz_count": len(results),
        },
        "played_quizzes": played_quizzes,
    }
