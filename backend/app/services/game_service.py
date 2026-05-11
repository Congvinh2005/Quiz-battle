from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.game.chat_messages import ChatMessage
from app.models.game.game_questions import GameQuestion
from app.models.game.game_rooms import GameRoom
from app.models.game.room_players import RoomPlayer
from app.models.game.player_answers import PlayerAnswer
from app.models.game.game_results import GameResult
from app.models.quiz.quizzes import Quiz
from app.models.quiz.questions import Question
from app.models.quiz.answer_options import AnswerOption
from app.models.user_auth.users import User
from app.models.user_stat.user_stats import UserStats
from app.websockets.game_socket import manager


def _serialize_room(room: GameRoom) -> dict:
	return {
		"id": str(room.id),
		"room_code": room.room_code,
		"host_id": str(room.host_id) if room.host_id else None,
		"quiz_id": str(room.quiz_id),
		"status": room.status,
		"started_at": room.started_at,
		"ended_at": room.ended_at,
	}


def _serialize_player(player: RoomPlayer) -> dict:
	return {
		"id": str(player.id),
		"room_id": str(player.room_id),
		"user_id": str(player.user_id),
		"display_name": player.display_name,
		"score": player.score,
	}


def _serialize_chat_message(message: ChatMessage) -> dict:
	return {
		"id": str(message.id),
		"room_id": str(message.room_id),
		"user_id": str(message.user_id),
		"message": message.message,
		"created_at": message.created_at,
		"updated_at": message.updated_at,
		"user": {
			"id": str(message.user.id) if message.user else None,
			"username": message.user.username if message.user else None,
		},
	}


def _serialize_answer_option(option: AnswerOption) -> dict:
	return {
		"id": str(option.id),
		"question_id": str(option.question_id),
		"content": option.content,
	}


def _serialize_question(question: Question) -> dict:
	return {
		"id": str(question.id),
		"quiz_id": str(question.quiz_id),
		"content": question.content,
		"question_type": question.question_type,
		"time_limit": question.time_limit,
		"points": question.points,
		"order_index": question.order_index,
		"answer_options": [_serialize_answer_option(option) for option in question.answer_options],
	}


def _serialize_room_state(room: GameRoom, db: Session) -> dict:
	players = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id).all()
	return {
		"room": _serialize_room(room),
		"players": [_serialize_player(player) for player in players],
		"player_count": len(players),
	}


def get_room_state(room_code: str, db: Session, current_user: UUID = None) -> dict:
	room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
	if not room:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

	quiz = room.quiz
	players = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id).all()
	serialized_players = [_serialize_player(player) for player in players]

	quiz_questions = sorted(list(quiz.questions or []), key=lambda question: question.order_index or 0)
	game_questions = sorted(list(room.game_questions or []), key=lambda game_question: game_question.question_order or 0)
	
	# Get current_question_order for current user (independent progress)
	current_question_order = 1
	if current_user and room.status == "PLAYING":
		current_player = db.query(RoomPlayer).filter(
			RoomPlayer.room_id == room.id,
			RoomPlayer.user_id == current_user
		).first()
		if current_player:
			current_question_order = current_player.current_question_order or 1
	elif room.status == "PLAYING":
		current_question_order = room.current_question_order or 1
	
	current_game_question = None
	if room.status == "PLAYING" and game_questions:
		for game_question in game_questions:
			if game_question.question_order == current_question_order:
				current_game_question = game_question
				break

	current_question = None
	if current_game_question and current_game_question.question:
		current_question = _serialize_question(current_game_question.question)
	elif room.status == "WAITING" and quiz_questions:
		current_question = _serialize_question(quiz_questions[0])

	# Leaderboard: only show score, no rank calculation
	leaderboard = [
		{
			"rank": index + 1,
			"user_id": player.user_id,
			"display_name": player.display_name,
			"score": player.score,
		}
		for index, player in enumerate(sorted(players, key=lambda player: player.score, reverse=True))
	]

	return {
		"room": _serialize_room(room),
		"quiz": {
			"id": str(quiz.id),
			"title": quiz.title,
			"description": quiz.description,
			"question_count": len(quiz_questions),
			"created_by": str(quiz.created_by) if quiz.created_by else None,
		},
		"players": serialized_players,
		"player_count": len(serialized_players),
		"settings": {
			"max_players": room.max_players,
			"shuffle_questions": room.shuffle_questions,
			"chat_enabled": room.chat_enabled,
			"current_question_order": current_question_order,
		},
		"game_state": {
			"status": room.status,
			"current_question_order": current_question_order,
			"current_question": current_question,
			"total_questions": len(game_questions) if game_questions else len(quiz_questions),
			"leaderboard": leaderboard,
		},
	}


def _build_room_code() -> str:
	return uuid4().hex[:6].upper()


def create_room(payload: dict, current_user: UUID, db: Session) -> dict:
	quiz_id = payload.get("quiz_id")
	if not quiz_id:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing quiz_id")

	quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
	if not quiz:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

	if not quiz.is_public and quiz.created_by != current_user:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to use this quiz")

	room = GameRoom(
		room_code=_build_room_code(),
		host_id=current_user,
		quiz_id=quiz.id,
		status="WAITING",
		max_players=payload.get("max_players", 30),
		shuffle_questions=payload.get("shuffle_questions", True),
		chat_enabled=payload.get("chat_enabled", True),
	)
	db.add(room)
	db.commit()
	db.refresh(room)

	user = db.query(User).filter(User.id == current_user).first()
	host_player = RoomPlayer(
		room_id=room.id,
		user_id=current_user,
		display_name=user.username if user else "Host",
		score=0,
		current_question_order=0,  # Not started yet
	)
	db.add(host_player)
	db.commit()

	return _serialize_room(room)


def get_room(room_code: str, db: Session) -> dict:
	room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
	if not room:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

	quiz = room.quiz
	question_count = len(quiz.questions) if quiz.questions else 0
	time_limit_sum = sum(question.time_limit or 0 for question in quiz.questions) if quiz.questions else 0
	total_duration_seconds = time_limit_sum + (question_count * 3)
	total_duration_minutes = total_duration_seconds // 60
	total_duration_remaining = total_duration_seconds % 60

	players = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id).all()
	serialized_players = [_serialize_player(player) for player in players]

	return {
		"id": str(room.id),
		"room_code": room.room_code,
		"host_id": str(room.host_id) if room.host_id else None,
		"status": room.status,
		"created_at": room.created_at,
		"started_at": room.started_at,
		"ended_at": room.ended_at,
		"quiz": {
			"id": str(quiz.id),
			"title": quiz.title,
			"description": quiz.description,
			"question_count": question_count,
			"total_duration_seconds": total_duration_seconds,
			"total_duration_formatted": f"~{total_duration_minutes}m {total_duration_remaining}s" if total_duration_minutes > 0 else f"~{total_duration_remaining}s",
			"created_by": str(quiz.created_by) if quiz.created_by else None,
		},
		"players": serialized_players,
		"player_count": len(serialized_players),
		"settings": {
			"max_players": room.max_players,
			"shuffle_questions": room.shuffle_questions,
			"chat_enabled": room.chat_enabled,
			"current_question_order": room.current_question_order,
		},
	}


async def join_room(room_code: str, payload: dict, current_user: UUID, db: Session) -> dict:
	room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
	if not room:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

	existing = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id, RoomPlayer.user_id == current_user).first()
	if not existing:
		player_count = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id).count()
		if player_count >= room.max_players:
			raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Room is full")

		if room.status != "WAITING":
			raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Room is not in WAITING status")

	display_name = payload.get("display_name")
	if not display_name:
		user = db.query(User).filter(User.id == current_user).first()
		display_name = user.username if user else "Player"

	# Determine current_question_order based on game status
	current_question_order = 1 if room.status == "PLAYING" else 0

	if existing:
		existing.display_name = display_name
		if room.status == "PLAYING":
			existing.current_question_order = 1
		db.commit()
		db.refresh(existing)
		await manager.broadcast(
			room.room_code,
			{
				"type": "PLAYER_JOINED",
				"data": {
					**_serialize_room_state(room, db),
					"player": _serialize_player(existing),
				},
			},
		)
		return _serialize_player(existing)

	player = RoomPlayer(
		room_id=room.id,
		user_id=current_user,
		display_name=display_name,
		score=0,
		current_question_order=current_question_order
	)
	db.add(player)
	db.commit()
	db.refresh(player)
	await manager.broadcast(
		room.room_code,
		{
			"type": "PLAYER_JOINED",
			"data": {
				**_serialize_room_state(room, db),
				"player": _serialize_player(player),
			},
		},
	)
	return _serialize_player(player)


async def leave_room(room_code: str, current_user: UUID, db: Session) -> None:
	room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
	if not room:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

	if room.host_id == current_user:
		room_state = _serialize_room_state(room, db)
		await manager.broadcast(
			room_code,
			{
				"type": "ROOM_CLOSED",
				"data": {
					**room_state,
					"reason": "HOST_LEFT",
					"message": "Host đã rời phòng, phòng đã đóng.",
				},
			},
		)
		db.delete(room)
		db.commit()
		return None

	player = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id, RoomPlayer.user_id == current_user).first()
	if player:
		departed_player = _serialize_player(player)
		db.delete(player)
		db.commit()
		remaining_players = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id).all()
		await manager.broadcast(
			room_code,
			{
				"type": "PLAYER_LEFT",
				"data": {
					"room_code": room_code,
					"player": departed_player,
					"players": [_serialize_player(remaining_player) for remaining_player in remaining_players],
					"player_count": len(remaining_players),
				},
			},
		)
	return None


def get_room_players(room_code: str, db: Session) -> list:
	room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
	if not room:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

	players = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id).all()
	return [_serialize_player(player) for player in players]


def _get_leaderboard(room: GameRoom, db: Session) -> list:
	"""Helper to get leaderboard sorted by score descending"""
	players = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id).all()
	sorted_players = sorted(players, key=lambda p: p.score, reverse=True)
	return [
		{
			"rank": idx + 1,
			"user_id": str(player.user_id),
			"display_name": player.display_name,
			"score": player.score,
		}
		for idx, player in enumerate(sorted_players)
	]


async def start_game(room_code: str, current_user: UUID, db: Session) -> dict:
	room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
	if not room:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

	if room.host_id != current_user:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only host can start the game")

	# Create game_questions from quiz questions
	quiz = room.quiz
	quiz_questions = sorted(
		list(quiz.questions or []),
		key=lambda q: q.order_index or 0
	)
	
	if not quiz_questions:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quiz has no questions")

	# Shuffle if enabled
	if room.shuffle_questions:
		import random
		shuffled = quiz_questions.copy()
		random.shuffle(shuffled)
		quiz_questions = shuffled

	# Create GameQuestion records
	for order_idx, question in enumerate(quiz_questions, start=1):
		game_question = GameQuestion(
			room_id=room.id,
			question_id=question.id,
			question_order=order_idx
		)
		db.add(game_question)

	room.status = "PLAYING"
	room.started_at = datetime.now(timezone.utc)
	room.current_question_order = 1  # Start at first question (for reference only)
	
	# Initialize each player's question progress
	players = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id).all()
	for player in players:
		player.current_question_order = 1
	
	db.commit()
	db.refresh(room)

	# Broadcast GAME_STARTED
	await manager.broadcast(
		room_code,
		{
			"type": "GAME_STARTED",
			"data": _serialize_room_state(room, db),
		},
	)

	# Broadcast initial QUESTION_CHANGED
	game_questions = db.query(GameQuestion).filter(
		GameQuestion.room_id == room.id,
		GameQuestion.question_order == 1
	).first()
	
	if game_questions:
		await manager.broadcast(
			room_code,
			{
				"type": "QUESTION_CHANGED",
				"data": {
					"current_question_order": 1,
					"total_questions": len(quiz_questions),
					"question": _serialize_question(game_questions.question),
				},
			},
		)

	return _serialize_room(room)


def get_room_results(room_code: str, db: Session) -> list:
	room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
	if not room:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

	results = []
	for player in db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id).all():
		results.append(
			{
				"room_id": str(room.id),
				"user_id": str(player.user_id),
				"display_name": player.display_name,
				"final_score": player.score,
				"rank": None,
			}
		)
	return results


def get_room_chat(room_code: str, db: Session, limit: int = 50, offset: int = 0) -> list:
	room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
	if not room:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

	messages = (
		db.query(ChatMessage)
		.filter(ChatMessage.room_id == room.id)
		.order_by(ChatMessage.created_at.desc())
		.offset(offset)
		.limit(limit)
		.all()
	)
	messages.reverse()
	return [_serialize_chat_message(message) for message in messages]


async def post_chat_message(room_code: str, current_user: UUID, payload: dict, db: Session) -> dict:
	"""Post a chat message to room"""
	room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
	if not room:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

	if not room.chat_enabled:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chat is disabled in this room")

	# Verify user is in room
	player = db.query(RoomPlayer).filter(
		RoomPlayer.room_id == room.id,
		RoomPlayer.user_id == current_user
	).first()
	if not player:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not in this room")

	message_text = payload.get("message", "").strip()
	if not message_text:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message cannot be empty")

	if len(message_text) > 500:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message is too long")

	message = ChatMessage(
		room_id=room.id,
		user_id=current_user,
		message=message_text
	)
	db.add(message)
	db.commit()
	db.refresh(message)

	# Broadcast CHAT_MESSAGE
	await manager.broadcast(
		room_code,
		{
			"type": "CHAT_MESSAGE",
			"data": _serialize_chat_message(message),
		},
	)

	return _serialize_chat_message(message)


async def submit_answer(room_code: str, current_user: UUID, payload: dict, db: Session) -> dict:
	"""Submit answer to current question"""
	room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
	if not room:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

	if room.status != "PLAYING":
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Game is not playing")

	# Get player
	player = db.query(RoomPlayer).filter(
		RoomPlayer.room_id == room.id,
		RoomPlayer.user_id == current_user
	).first()
	if not player:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not in this room")

	# Get current question
	current_question_order = room.current_question_order
	game_question = db.query(GameQuestion).filter(
		GameQuestion.room_id == room.id,
		GameQuestion.question_order == current_question_order
	).first()
	if not game_question:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Current question not found")

	# Check if already answered
	existing_answer = db.query(PlayerAnswer).filter(
		PlayerAnswer.room_id == room.id,
		PlayerAnswer.user_id == current_user,
		PlayerAnswer.question_id == game_question.question_id
	).first()
	if existing_answer:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already answered this question")

	# Get selected option
	selected_option_id = payload.get("selected_option_id")
	selected_option = db.query(AnswerOption).filter(AnswerOption.id == selected_option_id).first()
	if not selected_option:
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid option")

	question = game_question.question
	is_correct = selected_option.is_correct
	response_time = payload.get("response_time", 0)

	# Calculate score
	points = 0
	if is_correct:
		# Time-based scoring: if answered in < 3 seconds, get full points, otherwise reduced
		if response_time < 3:
			points = question.points
		else:
			points = max(int(question.points * 0.5), 1)

	# Create PlayerAnswer
	answer = PlayerAnswer(
		room_id=room.id,
		user_id=current_user,
		question_id=game_question.question_id,
		selected_option_id=selected_option_id,
		is_correct=is_correct,
		response_time=response_time
	)
	db.add(answer)

	# Update player score
	player.score += points
	db.commit()
	db.refresh(player)

	# Broadcast PLAYER_ANSWERED with updated leaderboard
	await manager.broadcast(
		room_code,
		{
			"type": "PLAYER_ANSWERED",
			"data": {
				"user_id": str(current_user),
				"question_order": current_question_order,
				"is_correct": is_correct,
				"points_earned": points,
				"leaderboard": _get_leaderboard(room, db),
			},
		},
	)

	return {
		"question_order": current_question_order,
		"is_correct": is_correct,
		"points_earned": points,
		"total_score": player.score,
		"leaderboard": _get_leaderboard(room, db),
	}


async def next_question(room_code: str, current_user: UUID, db: Session) -> dict:
	"""Move to next question - each player advances independently"""
	room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
	if not room:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

	if room.status != "PLAYING":
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Game is not playing")

	# Get current player in room
	player = db.query(RoomPlayer).filter(
		RoomPlayer.room_id == room.id,
		RoomPlayer.user_id == current_user
	).first()
	
	if not player:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not in room")

	# Get total questions
	total_questions = db.query(GameQuestion).filter(GameQuestion.room_id == room.id).count()
	current_order = player.current_question_order

	if current_order >= total_questions:
		# Player finished all questions
		return {
			"status": "FINISHED",
			"current_question_order": current_order,
			"total_questions": total_questions,
		}

	# Move to next question for this player only
	next_order = current_order + 1
	player.current_question_order = next_order
	db.commit()
	db.refresh(player)

	# Get next question
	game_question = db.query(GameQuestion).filter(
		GameQuestion.room_id == room.id,
		GameQuestion.question_order == next_order
	).first()

	return {
		"current_question_order": next_order,
		"total_questions": total_questions,
		"question": _serialize_question(game_question.question) if game_question else None,
		"status": "OK",
	}


async def finish_game(room_code: str, current_user: UUID, db: Session) -> dict:
	"""Finish game and create results"""
	room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
	if not room:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

	if room.host_id != current_user:
		raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only host can finish game")

	room.status = "FINISHED"
	room.ended_at = datetime.now(timezone.utc)

	# Get leaderboard
	players = db.query(RoomPlayer).filter(RoomPlayer.room_id == room.id).all()
	sorted_players = sorted(players, key=lambda p: p.score, reverse=True)

	# Create game results and update user stats
	for rank, player in enumerate(sorted_players, start=1):
		game_result = GameResult(
			room_id=room.id,
			user_id=player.user_id,
			final_score=player.score,
			rank=rank
		)
		db.add(game_result)

		# Update user stats
		user_stat = db.query(UserStats).filter(UserStats.user_id == player.user_id).first()
		if not user_stat:
			user_stat = UserStats(
				user_id=player.user_id,
				total_games=0,
				total_score=0,
				wins=0
			)
			db.add(user_stat)

		user_stat.total_games += 1
		user_stat.total_score += player.score
		if rank == 1:
			user_stat.wins += 1

	db.commit()

	# Broadcast GAME_ENDED with results
	await manager.broadcast(
		room_code,
		{
			"type": "GAME_ENDED",
			"data": {
				"room_code": room_code,
				"final_leaderboard": _get_leaderboard(room, db),
				"ended_at": room.ended_at.isoformat(),
			},
		},
	)

	return {
		"status": "FINISHED",
		"final_leaderboard": _get_leaderboard(room, db),
	}


def get_room_leaderboard(room_code: str, db: Session) -> dict:
	"""Get current room leaderboard"""
	room = db.query(GameRoom).filter(GameRoom.room_code == room_code).first()
	if not room:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found")

	return {
		"room_code": room_code,
		"status": room.status,
		"leaderboard": _get_leaderboard(room, db),
	}
