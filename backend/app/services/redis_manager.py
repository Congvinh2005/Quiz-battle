<<<<<<< HEAD
from datetime import datetime, timezone
from uuid import UUID
=======
from __future__ import annotations

import json
from typing import Any
>>>>>>> phuong

from redis import Redis

from app.core.config import settings
<<<<<<< HEAD
from app.core.exceptions import InvalidToken
from app.core.security import decode_token

REFRESH_TOKEN_PREFIX = "auth:refresh"
USER_REFRESH_TOKENS_PREFIX = "auth:user_refresh"

_redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)


def get_redis_client() -> Redis:
    return _redis_client


def refresh_token_key(jti: str) -> str:
    return f"{REFRESH_TOKEN_PREFIX}:{jti}"


def user_refresh_tokens_key(user_id: UUID | str) -> str:
    return f"{USER_REFRESH_TOKENS_PREFIX}:{user_id}"


def _token_ttl_seconds(expires_at: datetime) -> int:
    now = datetime.now(timezone.utc)
    expires_at_utc = expires_at if expires_at.tzinfo else expires_at.replace(tzinfo=timezone.utc)
    ttl = int((expires_at_utc - now).total_seconds())
    return max(ttl, 1)


def save_refresh_token(refresh_token: str) -> None:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise InvalidToken("Invalid refresh token")

    user_id = payload.get("sub")
    jti = payload.get("jti")
    exp = payload.get("exp")

    if not user_id or not jti or not exp:
        raise InvalidToken("Invalid refresh token payload")

    expires_at = datetime.fromtimestamp(float(exp), tz=timezone.utc)
    ttl_seconds = _token_ttl_seconds(expires_at)

    redis_client = get_redis_client()
    pipeline = redis_client.pipeline()
    pipeline.set(refresh_token_key(jti), user_id, ex=ttl_seconds)
    pipeline.sadd(user_refresh_tokens_key(user_id), jti)
    pipeline.expire(user_refresh_tokens_key(user_id), ttl_seconds)
    pipeline.execute()


def validate_refresh_token(refresh_token: str) -> str:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise InvalidToken("Invalid refresh token")

    user_id = payload.get("sub")
    jti = payload.get("jti")
    if not user_id or not jti:
        raise InvalidToken("Invalid refresh token payload")

    redis_client = get_redis_client()
    stored_user_id = redis_client.get(refresh_token_key(jti))
    if stored_user_id is None:
        raise InvalidToken("Refresh token not found")

    if stored_user_id != user_id:
        raise InvalidToken("Refresh token mismatch")

    return user_id


def revoke_refresh_token(refresh_token: str) -> None:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        return

    user_id = payload.get("sub")
    jti = payload.get("jti")
    if not user_id or not jti:
        return

    redis_client = get_redis_client()
    pipeline = redis_client.pipeline()
    pipeline.delete(refresh_token_key(jti))
    pipeline.srem(user_refresh_tokens_key(user_id), jti)
    pipeline.execute()


def revoke_user_refresh_tokens(user_id: UUID) -> None:
    redis_client = get_redis_client()
    token_ids = redis_client.smembers(user_refresh_tokens_key(user_id))

    pipeline = redis_client.pipeline()
    for jti in token_ids:
        pipeline.delete(refresh_token_key(jti))
    pipeline.delete(user_refresh_tokens_key(user_id))
    pipeline.execute()
=======


class RedisManager:
    """Small Redis facade for per-room runtime state."""

    def __init__(self, redis_url: str | None = None):
        self.client = Redis.from_url(redis_url or settings.REDIS_URL, decode_responses=True)

    def _room_prefix(self, room_code: str) -> str:
        return f"quizbattle:room:{room_code}"

    def _meta_key(self, room_code: str) -> str:
        return f"{self._room_prefix(room_code)}:meta"

    def _players_key(self, room_code: str) -> str:
        return f"{self._room_prefix(room_code)}:players"

    def _scores_key(self, room_code: str) -> str:
        return f"{self._room_prefix(room_code)}:scores"

    def _questions_key(self, room_code: str) -> str:
        return f"{self._room_prefix(room_code)}:questions"

    def _answers_key(self, room_code: str) -> str:
        return f"{self._room_prefix(room_code)}:answers"

    def _active_key(self, room_code: str) -> str:
        return f"{self._room_prefix(room_code)}:active"

    def _finished_key(self, room_code: str) -> str:
        return f"{self._room_prefix(room_code)}:finished"

    def _left_key(self, room_code: str) -> str:
        return f"{self._room_prefix(room_code)}:left"

    def _json_dumps(self, value: Any) -> str:
        return json.dumps(value, ensure_ascii=False)

    def _json_loads(self, value: str | None, default: Any = None) -> Any:
        if value is None:
            return default
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return default

    def delete_room_session(self, room_code: str) -> None:
        self.client.delete(
            self._meta_key(room_code),
            self._players_key(room_code),
            self._scores_key(room_code),
            self._questions_key(room_code),
            self._answers_key(room_code),
            self._active_key(room_code),
            self._finished_key(room_code),
            self._left_key(room_code),
        )

    def initialize_game_session(
        self,
        room_payload: dict,
        quiz_payload: dict,
        players: list[dict],
        questions: list[dict],
    ) -> None:
        room_code = room_payload["room_code"]

        meta_payload = {
            **room_payload,
            **quiz_payload,
            "total_questions": len(questions),
            "current_question_order": int(room_payload.get("current_question_order") or 1),
        }

        pipeline = self.client.pipeline()
        pipeline.delete(
            self._meta_key(room_code),
            self._players_key(room_code),
            self._scores_key(room_code),
            self._questions_key(room_code),
            self._answers_key(room_code),
            self._active_key(room_code),
            self._finished_key(room_code),
            self._left_key(room_code),
        )
        pipeline.hset(self._meta_key(room_code), mapping={key: self._json_dumps(value) for key, value in meta_payload.items()})

        if questions:
            pipeline.hset(
                self._questions_key(room_code),
                mapping={str(question["question_order"]): self._json_dumps(question) for question in questions},
            )

        if players:
            player_mapping = {}
            score_mapping = {}
            active_members = []
            for player in players:
                user_id = str(player["user_id"])
                player_data = {
                    **player,
                    "user_id": user_id,
                    "score": int(player.get("score") or 0),
                    "current_question_order": int(player.get("current_question_order") or 0),
                    "status": player.get("status", "ACTIVE"),
                }
                player_mapping[user_id] = self._json_dumps(player_data)
                score_mapping[user_id] = int(player_data["score"])
                active_members.append(user_id)

            pipeline.hset(self._players_key(room_code), mapping=player_mapping)
            pipeline.hset(self._scores_key(room_code), mapping=score_mapping)
            if active_members:
                pipeline.sadd(self._active_key(room_code), *active_members)

        pipeline.execute()

    def room_exists(self, room_code: str) -> bool:
        return bool(self.client.exists(self._meta_key(room_code)))

    def get_room_meta(self, room_code: str) -> dict[str, Any] | None:
        meta = self.client.hgetall(self._meta_key(room_code))
        if not meta:
            return None
        return {key: self._json_loads(value, value) for key, value in meta.items()}

    def get_room_players(self, room_code: str, include_left: bool = False) -> list[dict[str, Any]]:
        players = self.client.hgetall(self._players_key(room_code))
        if not players:
            return []

        active_ids = set(self.client.smembers(self._active_key(room_code)))
        left_ids = set(self.client.smembers(self._left_key(room_code)))

        result: list[dict[str, Any]] = []
        for value in players.values():
            player = self._json_loads(value, {})
            user_id = str(player.get("user_id"))
            if not include_left and user_id in left_ids:
                continue
            if active_ids and not include_left and user_id not in active_ids and player.get("status") not in ("FINISHED", "ACTIVE"):
                continue
            result.append(player)
        return result

    def get_room_scores(self, room_code: str) -> dict[str, int]:
        scores = self.client.hgetall(self._scores_key(room_code))
        return {user_id: int(score or 0) for user_id, score in scores.items()}

    def get_room_questions(self, room_code: str) -> dict[int, dict[str, Any]]:
        questions = self.client.hgetall(self._questions_key(room_code))
        return {
            int(question_order): self._json_loads(question_value, {})
            for question_order, question_value in questions.items()
        }

    def get_question(self, room_code: str, question_order: int) -> dict[str, Any] | None:
        question = self.client.hget(self._questions_key(room_code), str(question_order))
        return self._json_loads(question, None)

    def set_player(self, room_code: str, user_id: str, player_data: dict[str, Any]) -> None:
        self.client.hset(self._players_key(room_code), user_id, self._json_dumps(player_data))

    def get_player(self, room_code: str, user_id: str) -> dict[str, Any] | None:
        player = self.client.hget(self._players_key(room_code), user_id)
        return self._json_loads(player, None)

    def set_player_current_question_order(self, room_code: str, user_id: str, question_order: int) -> None:
        player = self.get_player(room_code, user_id)
        if not player:
            return
        player["current_question_order"] = int(question_order)
        self.set_player(room_code, user_id, player)

    def set_player_finished(self, room_code: str, user_id: str) -> None:
        player = self.get_player(room_code, user_id)
        if not player:
            return
        player["status"] = "FINISHED"
        self.set_player(room_code, user_id, player)
        pipeline = self.client.pipeline()
        pipeline.srem(self._active_key(room_code), user_id)
        pipeline.sadd(self._finished_key(room_code), user_id)
        pipeline.execute()

    def set_player_left(self, room_code: str, user_id: str) -> None:
        player = self.get_player(room_code, user_id)
        if player:
            player["status"] = "LEFT"
            self.set_player(room_code, user_id, player)
        pipeline = self.client.pipeline()
        pipeline.srem(self._active_key(room_code), user_id)
        pipeline.srem(self._finished_key(room_code), user_id)
        pipeline.sadd(self._left_key(room_code), user_id)
        pipeline.execute()

    def increment_score(self, room_code: str, user_id: str, points: int) -> int:
        return int(self.client.hincrby(self._scores_key(room_code), user_id, int(points)))

    def get_score(self, room_code: str, user_id: str) -> int:
        return int(self.client.hget(self._scores_key(room_code), user_id) or 0)

    def store_answer(self, room_code: str, user_id: str, question_id: str, answer_payload: dict[str, Any]) -> None:
        key = f"{user_id}:{question_id}"
        self.client.hset(self._answers_key(room_code), key, self._json_dumps(answer_payload))

    def has_answer(self, room_code: str, user_id: str, question_id: str) -> bool:
        key = f"{user_id}:{question_id}"
        return bool(self.client.hexists(self._answers_key(room_code), key))

    def get_answers_for_player(self, room_code: str, user_id: str) -> list[dict[str, Any]]:
        answers = self.client.hgetall(self._answers_key(room_code))
        prefix = f"{user_id}:"
        result: list[dict[str, Any]] = []
        for key, value in answers.items():
            if key.startswith(prefix):
                answer = self._json_loads(value, {})
                if answer:
                    result.append(answer)
        return sorted(result, key=lambda item: int(item.get("question_order") or 0))

    def get_room_answers(self, room_code: str) -> dict[str, dict[str, Any]]:
        answers = self.client.hgetall(self._answers_key(room_code))
        return {key: self._json_loads(value, {}) for key, value in answers.items()}

    def get_competing_players(self, room_code: str) -> list[dict[str, Any]]:
        players = self.get_room_players(room_code, include_left=False)
        return [player for player in players if player.get("status") in ("ACTIVE", "FINISHED")]

    def get_leaderboard(self, room_code: str) -> list[dict[str, Any]]:
        scores = self.get_room_scores(room_code)
        players = self.get_competing_players(room_code)
        sorted_players = sorted(
            players,
            key=lambda player: (
                -scores.get(str(player.get("user_id")), 0),
                (player.get("display_name") or "").lower(),
                str(player.get("user_id") or ""),
            ),
        )
        return [
            {
                "rank": index + 1,
                "user_id": str(player.get("user_id")),
                "display_name": player.get("display_name"),
                "score": scores.get(str(player.get("user_id")), 0),
            }
            for index, player in enumerate(sorted_players)
        ]

    def active_player_count(self, room_code: str) -> int:
        return int(self.client.scard(self._active_key(room_code)))

    def get_total_questions(self, room_code: str) -> int:
        meta = self.get_room_meta(room_code) or {}
        total_questions = meta.get("total_questions")
        return int(total_questions or 0)


redis_manager = RedisManager()
>>>>>>> phuong
