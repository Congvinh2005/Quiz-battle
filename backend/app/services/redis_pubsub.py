from __future__ import annotations

import asyncio
import json
import logging
from typing import Any
from uuid import uuid4

import redis.asyncio as redis

from app.core.config import settings

logger = logging.getLogger(__name__)

INSTANCE_ID = str(uuid4())
WS_BROADCAST_CHANNEL = "quizbattle:ws:broadcast"

_redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


async def publish_ws_event(room_code: str, message: dict[str, Any]) -> None:
    """Publish a WebSocket event so other backend instances can broadcast it locally."""
    payload = {
        "instance_id": INSTANCE_ID,
        "room_code": room_code,
        "message": message,
    }

    try:
        await _redis_client.publish(WS_BROADCAST_CHANNEL, json.dumps(payload, ensure_ascii=False))
    except Exception as exc:
        logger.warning("Failed to publish websocket event to Redis: %s", exc)


async def listen_ws_events(manager: Any) -> None:
    """Listen for Redis Pub/Sub websocket events from other backend instances."""
    pubsub = _redis_client.pubsub()
    try:
        await pubsub.subscribe(WS_BROADCAST_CHANNEL)
        async for item in pubsub.listen():
            if item.get("type") != "message":
                continue

            try:
                payload = json.loads(item.get("data") or "{}")
            except json.JSONDecodeError:
                continue

            if payload.get("instance_id") == INSTANCE_ID:
                continue

            room_code = payload.get("room_code")
            message = payload.get("message")
            if not room_code or not isinstance(message, dict):
                continue

            await manager.broadcast_local(room_code, message)
    except asyncio.CancelledError:
        raise
    except Exception as exc:
        logger.warning("Redis websocket pub/sub listener stopped: %s", exc)
    finally:
        try:
            await pubsub.unsubscribe(WS_BROADCAST_CHANNEL)
            await pubsub.close()
        except Exception:
            pass


async def close_pubsub() -> None:
    await _redis_client.aclose()
