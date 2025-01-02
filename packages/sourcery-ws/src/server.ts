import { Server as WSServer } from "socket.io";
import { SourcerySub } from "@sourcery/queue/src/sub.ts";

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

io.on("connection", (socket) => {
    if (debug) {
        console.log("Client connected", socket.id);
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