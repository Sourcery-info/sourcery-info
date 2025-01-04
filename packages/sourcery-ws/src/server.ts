import { Server as WSServer } from "socket.io";
import { SourcerySub } from "@sourcery/queue/src/sub.ts";
import { validateSessionToken, type Session } from "@sourcery/frontend/src/lib/server/auth.js";

import dotenv from "dotenv";
dotenv.config();

const port = Number(process.env.WEBSOCKET_PORT) || 3001;
const debug = process.env.NODE_ENV !== "production";

export const io = new WSServer(port, {
    cors: {
        origin: "*",
    }
});
console.log(`Websocket server listening on port ${port}`);

io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        if (debug) {
            console.log("No token provided");
        }
        return next(new Error("Authentication token required"));
    }

    try {
        const session = await validateSessionToken(token);
        if (!session) {
            if (debug) {
                console.log("Invalid authentication token");
            }
            return next(new Error("Invalid authentication token"));
        }
        
        // Attach the session to the socket for later use
        socket.data.session = session;
        next();
    } catch (error) {
        if (debug) {
            console.log("Authentication failed", error);
        }
        return next(new Error("Authentication failed"));
    }
});

io.on("connection", (socket) => {
    const session = socket.data.session as Session;
    
    if (debug) {
        console.log("Client connected", socket.id, "user:", session.user_id);
    }
    socket.on("disconnect", () => {
        if (debug) {
            console.log("Client disconnected", socket.id);
        }
    });
    socket.on("ping", () => {
        if (debug) {
            console.log("Received ping");
        }
        socket.emit("pong");
    });
    socket.on("subscribe", (channel: string) => {
        if (debug) {
            console.log(`Subscribing to ${channel}`);
        }
        socket.join(channel);
    });
    socket.on("unsubscribe", (channel: string) => {
        if (debug) {
            console.log(`Unsubscribing from ${channel}`);
        }
        socket.leave(channel);
    });
});

new SourcerySub(async (data: any) => {
    if (debug) {
        console.log("Received message", data);
    }
    emit(data.channel, data);
    return true;
}, "sourcery.info-ws");

export function emit(channel: string, data: any) {
    if (debug) {
        console.log(`Emitting to ${channel}`, data);
    }
    io.to(channel).emit(channel, data);
}