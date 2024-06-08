import { io } from "socket.io-client";

let socket: any = null;

let subscribed_channels = new Set<string>();
let connected = false;

export function connect(port: number = 3001) {
    console.log(`Connecting to websocket server on port ${port}`);
    socket = io(`http://localhost:${port}`);
    socket.on("connect", () => {
        connected = true;
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
    }
}

export async function ping() {
    socket.emit("ping");
    socket.on("pong", () => {
        console.log("Received pong");
    });
}
