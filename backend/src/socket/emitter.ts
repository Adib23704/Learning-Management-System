import { logger } from "../config/logger.js";
import { getIO } from "./index.js";

export function emitToUser(userId: string, event: string, data: unknown) {
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit(event, data);
  } catch (err) {
    logger.warn({ userId, event, err }, "Failed to emit socket event");
  }
}

export function emitToRoom(room: string, event: string, data: unknown) {
  try {
    const io = getIO();
    io.to(room).emit(event, data);
  } catch (err) {
    logger.warn({ room, event, err }, "Failed to emit socket event to room");
  }
}
