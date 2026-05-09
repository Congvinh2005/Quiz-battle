from datetime import datetime, timezone
from uuid import UUID

from redis import Redis

from app.core.config import settings
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
