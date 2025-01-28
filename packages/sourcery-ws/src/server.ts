import { Server as WSServer } from "socket.io";
import { SourcerySub } from "@sourcery/queue/src/sub.ts";
import { validateSessionToken, type Session } from "@sourcery/frontend/src/lib/server/auth.js";
import { logger } from "@sourcery/common/src/logger";
import dotenv from "dotenv";
dotenv.config();

const port = Number(process.env.WEBSOCKET_PORT) || 3001;
const debug = process.env.NODE_ENV !== "production";

export const io = new WSServer(port, {
    cors: {
        origin: "*",
    }
});
logger.info({ msg: `Websocket server listening on port ${port}`, tags: ['ws', 'info'] });

io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        logger.error({ msg: "No token provided", tags: ['ws', 'error'] });
        return next(new Error("Authentication token required"));
    }

    try {
        const session = await validateSessionToken(token);
        if (!session) {
            logger.error({ msg: "Invalid authentication token", tags: ['ws', 'error'] });
            return next(new Error("Invalid authentication token"));
        }
        
        // Attach the session to the socket for later use
        socket.data.session = session;
        next();
    } catch (error) {
        logger.error({ msg: "Authentication failed", error: error, tags: ['ws', 'error'] });
        return next(new Error("Authentication failed"));
    }
});

io.on("connection", (socket) => {
    const session = socket.data.session as Session;
    
    logger.info({ msg: "Client connected", socket_id: socket.id, user_id: session.user_id, tags: ['ws', 'info'] });
    socket.on("disconnect", () => {
        logger.info({ msg: "Client disconnected", socket_id: socket.id, tags: ['ws', 'info'] });
    });
    socket.on("ping", () => {
        socket.emit("pong");
    });
    socket.on("subscribe", (channel: string) => {
        logger.info({ msg: `Subscribing to ${channel}`, socket_id: socket.id, tags: ['ws', 'info'] });
        socket.join(channel);
    });
    socket.on("unsubscribe", (channel: string) => {
        logger.info({ msg: `Unsubscribing from ${channel}`, socket_id: socket.id, tags: ['ws', 'info'] });
        socket.leave(channel);
    });
});

new SourcerySub(async (data: any) => {
    logger.info({ msg: "Received message", data: data, tags: ['ws', 'info'] });
    emit(data.channel, data);
    return true;
}, "sourcery.info-ws");

export function emit(channel: string, data: any) {
    logger.info({ msg: `Emitting to ${channel}`, data: data, tags: ['ws', 'info'] });
    io.to(channel).emit(channel, data);
}