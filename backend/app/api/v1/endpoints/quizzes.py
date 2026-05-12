from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models.quiz.quizzes import Quiz

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@router.get("/", response_model=list)
def list_quizzes(db: Session = Depends(get_db)):
    quizzes = db.query(Quiz).all()
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
def get_quiz(quiz_id: UUID, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    return {
        "id": str(quiz.id),
        "title": quiz.title,
        "description": quiz.description,
        "is_public": quiz.is_public,
        "created_by": str(quiz.created_by) if quiz.created_by else None,
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

    return {
        "id": str(quiz.id),
        "title": quiz.title,
        "description": quiz.description,
        "is_public": quiz.is_public,
        "created_by": str(quiz.created_by) if quiz.created_by else None,
    }
