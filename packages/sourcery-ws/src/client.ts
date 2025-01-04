import { io } from "socket.io-client";

let socket: any = null;

let subscribed_channels = new Map<string, (data: any) => void>();
let connected = false;

export async function connect(url: string, sessionToken: string): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log(`Connecting to websocket server on ${url}`);
        socket = io(url, {
            auth: {
                token: sessionToken
            }
        });
        socket.on("connect", () => {
            console.log("Connected to websocket server");
            connected = true;
            for (const channel of subscribed_channels.keys()) {
                socket.emit("subscribe", channel);
                socket.on(channel, (data: any) => {
                    subscribed_channels.get(channel)?.(data);
                });
            }
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
        subscribed_channels.set(channel, callback);
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
    for (const channel of subscribed_channels.keys()) {
        socket.emit("unsubscribe", channel);
    }
    subscribed_channels.clear();
}

export async function ping() {
    socket.emit("ping");
    socket.on("pong", () => {
        console.log("Received pong");
    });
}
