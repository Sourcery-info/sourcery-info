import { io } from "socket.io-client";

let socket: any = null;

let subscribed_channels = new Set<string>();
let connected = false;

export async function connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log(`Connecting to websocket server on ${url}`);
        socket = io(url);
        socket.on("connect", () => {
            console.log("Connected to websocket server");
            connected = true;
            resolve();
        });
        socket.on("disconnect", () => {
            console.log("Disconnected from websocket server");
            connected = false;
        });
        socket.on("error", (error: any) => {
            console.error("Error connecting to websocket server", error);
            reject(error);
        });
    });
}

export async function subscribe(
    channel: string,
    callback: (data: any) => void
) {
    if (!subscribed_channels.has(channel)) {
        socket.emit("subscribe", channel);
        subscribed_channels.add(channel);
        socket.on(channel, (data: any) => {
            callback(data);
        });
    }
}

export async function unsubscribe(channel: string) {
    if (subscribed_channels.has(channel)) {
        socket.emit("unsubscribe", channel);
        subscribed_channels.delete(channel);
        socket.off(channel);
    }
}

export async function unsubscribe_all() {
    subscribed_channels.forEach((channel) => {
        socket.emit("unsubscribe", channel);
        socket.off(channel);
    });
    subscribed_channels.clear();
}

export async function ping() {
    socket.emit("ping");
    socket.on("pong", () => {
        console.log("Received pong");
    });
}
