import io, { Socket } from "socket.io-client";
import { WSRoomEvent } from "@/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(token: string, roomCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(WS_URL, {
          auth: {
            token,
          },
          query: {
            room_code: roomCode,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        this.socket.on("connect", () => {
          console.log("WebSocket connected");
          resolve();
        });

        this.socket.on("error", (error) => {
          console.error("WebSocket error:", error);
          reject(error);
        });

        this.socket.on("disconnect", (reason) => {
          console.log("WebSocket disconnected:", reason);
        });

        // Generic event listener
        this.socket.on("message", (event: WSRoomEvent) => {
          this.notifyListeners(event.type, event.data);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(eventType: string, data: any): void {
    if (this.socket) {
      this.socket.emit("message", {
        type: eventType,
        data,
      });
    }
  }

  on(eventType: string, callback: (data: any) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
  }

  off(eventType: string, callback: (data: any) => void): void {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType)!.delete(callback);
    }
  }

  private notifyListeners(eventType: string, data: any): void {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType)!.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${eventType}:`, error);
        }
      });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const wsService = new WebSocketService();
