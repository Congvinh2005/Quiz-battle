from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models.quiz.quizzes import Quiz
from app.models.quiz.questions import Question
from app.models.quiz.answer_options import AnswerOption

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@router.get("/", response_model=list)
def list_quizzes(
    current_user: UUID = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quizzes = (
        db.query(Quiz)
        .filter((Quiz.created_by == current_user) | (Quiz.is_public.is_(True)))
        .all()
    )
    result = []
    for q in quizzes:
        result.append({
            "id": str(q.id),
            "title": q.title,
            "description": q.description,
            "is_public": q.is_public,
            "created_by": str(q.created_by) if q.created_by else None,
        })
    return result


@router.get("/{quiz_id}", response_model=dict)
def get_quiz(
    quiz_id: UUID,
    current_user: UUID = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    if quiz.created_by != current_user and not quiz.is_public:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to view this quiz")

    questions = []
    for q in quiz.questions:
        answer_options = []
        for opt in q.answer_options:
            answer_options.append({
                "id": str(opt.id),
                "content": opt.content,
                "is_correct": opt.is_correct,
            })
        questions.append({
            "id": str(q.id),
            "content": q.content,
            "question_type": q.question_type,
            "time_limit": q.time_limit,
            "points": q.points,
            "order_index": q.order_index,
            "answer_options": answer_options,
        })

    return {
        "id": str(quiz.id),
        "title": quiz.title,
        "description": quiz.description,
        "is_public": quiz.is_public,
        "created_by": str(quiz.created_by) if quiz.created_by else None,
        "questions": questions,
    }


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_quiz(payload: dict, current_user: UUID = Depends(get_current_user), db: Session = Depends(get_db)):
    title = payload.get("title")
    if not title:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing title")

    quiz = Quiz(title=title, description=payload.get("description"), is_public=payload.get("is_public", False), created_by=current_user)
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    questions_data = payload.get("questions", [])
    if questions_data:
        for q_data in questions_data:
            question = Question(
                quiz_id=quiz.id,
                content=q_data.get("content"),
                question_type=q_data.get("question_type"),
                time_limit=q_data.get("time_limit"),
                points=q_data.get("points", 100),
                order_index=q_data.get("order_index"),
            )
            db.add(question)
            db.flush()

            for opt_data in q_data.get("answer_options", []):
                option = AnswerOption(
                    question_id=question.id,
                    content=opt_data.get("content"),
                    is_correct=opt_data.get("is_correct", False),
                )
                db.add(option)

        db.commit()

    return {
        "id": str(quiz.id),
        "title": quiz.title,
        "description": quiz.description,
        "is_public": quiz.is_public,
        "created_by": str(quiz.created_by) if quiz.created_by else None,
    }


@router.put("/{quiz_id}", response_model=dict)
def update_quiz(
    quiz_id: UUID,
    payload: dict,
    current_user: UUID = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    if quiz.created_by != current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to edit this quiz")

    title = payload.get("title")
    if not title:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing title")

    quiz.title = title
    quiz.description = payload.get("description")
    quiz.is_public = payload.get("is_public", False)

    questions_data = payload.get("questions", [])
    if questions_data:
        db.query(Question).filter(Question.quiz_id == quiz_id).delete()
        db.commit()

        for q_data in questions_data:
            question = Question(
                quiz_id=quiz_id,
                content=q_data.get("content"),
                question_type=q_data.get("question_type"),
                time_limit=q_data.get("time_limit"),
                points=q_data.get("points", 100),
                order_index=q_data.get("order_index"),
            )
            db.add(question)
            db.flush()

            for opt_data in q_data.get("answer_options", []):
                option = AnswerOption(
                    question_id=question.id,
                    content=opt_data.get("content"),
                    is_correct=opt_data.get("is_correct", False),
                )
                db.add(option)

    db.commit()
    db.refresh(quiz)

    return {
        "id": str(quiz.id),
        "title": quiz.title,
        "description": quiz.description,
        "is_public": quiz.is_public,
        "created_by": str(quiz.created_by) if quiz.created_by else None,
    }


@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quiz(
    quiz_id: UUID,
    current_user: UUID = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    if quiz.created_by != current_user:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to delete this quiz")

    db.delete(quiz)
    db.commit()
