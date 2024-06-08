import { Server as WSServer } from "socket.io";
import { SourceryWorker } from "@sourcery/pipeline/src/worker.ts";

import dotenv from "dotenv";
dotenv.config();

export const io = new WSServer({
    cors: {
        origin: "*",
    },
});
io.listen(Number(process.env.WEBSOCKET_PORT) || 3001);

io.on("connection", (socket) => {
    console.log("Client connected");
    socket.on("disconnect", () => {
        // console.log("Client disconnected");
    });
    socket.on("ping", () => {
        // console.log("Received ping");
        socket.emit("pong");
    });
    socket.on("subscribe", (channel: string) => {
        // console.log(`Subscribing to ${channel}`);
        socket.join(channel);
    });
    socket.on("unsubscribe", (channel: string) => {
        // console.log(`Unsubscribing from ${channel}`);
        socket.leave(channel);
    });
});

const worker = new SourceryWorker(async (data: any) => {
    emit(data.channel, data);
    return true;
}, "sourcery.info-ws");

export function emit(channel: string, data: any) {
    console.log(`Emitting to ${channel}`, data);
    io.to(channel).emit(channel, data);
}
