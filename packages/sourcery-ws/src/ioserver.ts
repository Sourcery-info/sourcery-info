import { Server as WSServer } from "socket.io";
import { SourcerySub } from "@sourcery/queue/src/sub.ts";

export class IOServer {
    private static instance: IOServer;
    private io!: WSServer;

    constructor(port: number = Number(process.env.WEBSOCKET_PORT) || 3001) {
        if (IOServer.instance) {
            return IOServer.instance;
        }

        this.io = new WSServer(port, {
            cors: {
                origin: "*",
            }
        });

        this.setupEventHandlers();
        this.setupSubscriber();
        IOServer.instance = this;
    }

    private setupEventHandlers() {
        this.io.on("connection", (socket) => {
            // console.log("Client connected");
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
            socket.onAny((event, data) => {
                // console.log(`Received event ${event}`, data);
            });
        });
    }

    private setupSubscriber() {
        new SourcerySub(async (data: any) => {
            this.emit(data.channel, data);
            return true;
        }, "sourcery.info-ws");
    }

    public emit(channel: string, data: any) {
        // console.log(`Emitting to ${channel}`, data);
        this.io.of(channel).emit(data);
    }

    public static getInstance(): IOServer {
        if (!IOServer.instance) {
            IOServer.instance = new IOServer();
        }
        return IOServer.instance;
    }

    public static emit(channel: string, data: any) {
        const instance = IOServer.getInstance();
        instance.emit(channel, data);
    }
}
