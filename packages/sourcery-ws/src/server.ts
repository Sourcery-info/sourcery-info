import { Server as WSServer } from "socket.io";
import { SourcerySub } from "@sourcery/queue/src/sub.ts";
import { validateSessionToken, type Session } from "@sourcery/frontend/src/lib/server/auth.js";
import { logger } from "@sourcery/common/src/logger";
import dotenv from "dotenv";
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { createServer } from 'http';

dotenv.config();

const port = Number(process.env.WEBSOCKET_PORT) || 3001;
const MAX_CONNECTIONS_PER_IP = Number(process.env.WEBSOCKET_MAX_CONNECTIONS_PER_IP) || 50;
const RATE_LIMIT_POINTS = Number(process.env.WEBSOCKET_RATE_LIMIT_POINTS) || 30;
const RATE_LIMIT_DURATION = Number(process.env.WEBSOCKET_RATE_LIMIT_DURATION) || 60; // 60 seconds
const PING_INTERVAL = Number(process.env.WEBSOCKET_PING_INTERVAL) || 25000; // 25 seconds
const PING_TIMEOUT = Number(process.env.WEBSOCKET_PING_TIMEOUT) || 10000; // 10 seconds

// Create rate limiter
const rateLimiter = new RateLimiterMemory({
    points: RATE_LIMIT_POINTS,
    duration: RATE_LIMIT_DURATION,
});

// Create HTTP server (needed for graceful shutdown)
const httpServer = createServer();

export const io = new WSServer(httpServer, {
    cors: {
        origin: "*",
    },
    pingInterval: PING_INTERVAL,
    pingTimeout: PING_TIMEOUT,
    connectTimeout: 10000,
});

// Track connections per IP
const connectionsPerIP = new Map<string, number>();

io.use(async (socket, next) => {
    try {
        // Rate limiting
        const ip = socket.handshake.address;
        try {
            await rateLimiter.consume(ip);
        } catch (error) {
            logger.warn({ msg: "Rate limit exceeded", ip, tags: ['ws', 'rate-limit'] });
            return next(new Error("Too many requests"));
        }

        // Connection limiting per IP
        const currentConnections = connectionsPerIP.get(ip) || 0;
        if (currentConnections >= MAX_CONNECTIONS_PER_IP) {
            logger.warn({ msg: "Too many connections from IP", ip, tags: ['ws', 'connection-limit'] });
            return next(new Error("Too many connections"));
        }
        connectionsPerIP.set(ip, currentConnections + 1);

        // Token validation
        const token = socket.handshake.auth.token;
        if (!token) {
            logger.error({ msg: "No token provided", tags: ['ws', 'error'] });
            return next(new Error("Authentication token required"));
        }

        const session = await validateSessionToken(token);
        if (!session) {
            logger.error({ msg: "Invalid authentication token", tags: ['ws', 'error'] });
            return next(new Error("Invalid authentication token"));
        }
        
        // Attach the session and metadata to the socket
        socket.data.session = session;
        socket.data.connectedAt = new Date();
        socket.data.ip = ip;
        
        next();
    } catch (error) {
        logger.error({ msg: "Authentication failed", error: error, tags: ['ws', 'error'] });
        return next(new Error("Authentication failed"));
    }
});

io.on("connection", (socket) => {
    const session = socket.data.session as Session;
    const ip = socket.data.ip;
    
    logger.info({ 
        msg: "Client connected", 
        socket_id: socket.id, 
        user_id: session.user_id, 
        ip: ip,
        tags: ['ws', 'info'] 
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
        const ip = socket.data.ip;
        const currentConnections = connectionsPerIP.get(ip);
        if (currentConnections) {
            connectionsPerIP.set(ip, currentConnections - 1);
        }

        logger.info({ 
            msg: "Client disconnected", 
            socket_id: socket.id,
            reason: reason,
            connection_duration: new Date().getTime() - socket.data.connectedAt.getTime(),
            tags: ['ws', 'info'] 
        });
    });

    // Handle errors
    socket.on("error", (error) => {
        logger.error({ 
            msg: "Socket error", 
            socket_id: socket.id,
            error: error,
            tags: ['ws', 'error'] 
        });
    });

    // Handle ping/pong for custom heartbeat if needed
    socket.on("ping", () => {
        try {
            socket.emit("pong");
        } catch (error) {
            logger.error({ 
                msg: "Error sending pong", 
                socket_id: socket.id,
                error: error,
                tags: ['ws', 'error'] 
            });
        }
    });

    // Handle channel subscription
    socket.on("subscribe", (channel: string) => {
        try {
            logger.debug({ 
                msg: `Subscribing to ${channel}`, 
                socket_id: socket.id, 
                channel: channel,
                tags: ['ws', 'debug'] 
            });
            socket.join(channel);
        } catch (error) {
            logger.error({ 
                msg: "Error subscribing to channel", 
                socket_id: socket.id,
                channel: channel,
                error: error,
                tags: ['ws', 'error'] 
            });
        }
    });

    socket.on("unsubscribe", (channel: string) => {
        try {
            logger.debug({ 
                msg: `Unsubscribing from ${channel}`, 
                socket_id: socket.id, 
                channel: channel,
                tags: ['ws', 'debug'] 
            });
            socket.leave(channel);
        } catch (error) {
            logger.error({ 
                msg: "Error unsubscribing from channel", 
                socket_id: socket.id,
                channel: channel,
                error: error,
                tags: ['ws', 'error'] 
            });
        }
    });
});

// Initialize queue subscriber
new SourcerySub(async (data: any) => {
    try {
        emit(data.channel, data);
        return true;
    } catch (error) {
        logger.error({ 
            msg: "Error processing queue message", 
            error: error,
            data: data,
            tags: ['ws', 'error'] 
        });
        return false;
    }
}, "sourcery.info-ws");

export function emit(channel: string, data: any) {
    try {
        logger.debug({ 
            msg: `Emitting to ${channel}`, 
            channel: channel,
            data: data,
            recipients: io.sockets.adapter.rooms.get(channel)?.size || 0,
            tags: ['ws', 'debug'] 
        });
        io.to(channel).emit(channel, data);
    } catch (error) {
        logger.error({ 
            msg: "Error emitting message", 
            channel: channel,
            error: error,
            tags: ['ws', 'error'] 
        });
    }
}

// Graceful shutdown handling
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function shutdown() {
    logger.info({ msg: "Initiating graceful shutdown", tags: ['ws', 'info'] });
    
    // Close all socket connections
    io.sockets.sockets.forEach((socket) => {
        socket.disconnect(true);
    });

    // Close the socket.io server
    await new Promise<void>((resolve) => {
        io.close(() => {
            logger.info({ msg: "Socket.IO server closed", tags: ['ws', 'info'] });
            resolve();
        });
    });

    // Close the HTTP server
    await new Promise<void>((resolve) => {
        httpServer.close(() => {
            logger.info({ msg: "HTTP server closed", tags: ['ws', 'info'] });
            resolve();
        });
    });

    process.exit(0);
}

// Start the server
httpServer.listen(port, () => {
    logger.info({ msg: `Websocket server listening on port ${port}`, tags: ['ws', 'info'] });
});