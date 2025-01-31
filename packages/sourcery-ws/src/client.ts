import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let subscribed_channels = new Map<string, (data: any) => void>();

export async function connect(url: string, sessionToken: string): Promise<void> {
    // If already connected, disconnect first
    if (socket?.connected) {
        socket.disconnect();
    }
    
    return new Promise((resolve, reject) => {
        console.log(`Connecting to websocket server on ${url}`);
        socket = io(url, {
            auth: {
                token: sessionToken
            },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000
        });

        socket.on("connect", () => {
            console.log("Connected to websocket server");
            // Resubscribe to all channels after reconnection
            for (const [channel, callback] of subscribed_channels.entries()) {
                socket?.emit("subscribe", channel);
                socket?.on(channel, callback);
            }
            resolve();
        });

        socket.on("disconnect", (reason: Socket.DisconnectReason) => {
            console.log("Disconnected from websocket server:", reason);
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
    if (!socket?.connected) {
        console.warn("Socket not connected, caching subscription for later");
        subscribed_channels.set(channel, callback);
        return;
    }

    if (!subscribed_channels.has(channel)) {
        socket.emit("subscribe", channel);
        subscribed_channels.set(channel, callback);
        socket.on(channel, (data: any) => {
            callback(data);
        });
    }
}

export async function unsubscribe(channel: string) {
    if (socket?.connected && subscribed_channels.has(channel)) {
        socket.emit("unsubscribe", channel);
        subscribed_channels.delete(channel);
        socket.off(channel);
    }
}

export async function unsubscribe_all() {
    if (socket?.connected) {
        for (const channel of subscribed_channels.keys()) {
            socket.emit("unsubscribe", channel);
        }
    }
    subscribed_channels.clear();
    socket?.removeAllListeners();
}

export async function ping() {
    if (socket?.connected) {
        socket.emit("ping");
        socket.on("pong", () => {
            console.log("Received pong");
        });
    }
}

// Clean up function to be called when the client is done
export async function cleanup() {
    await unsubscribe_all();
    socket?.disconnect();
    socket = null;
}
