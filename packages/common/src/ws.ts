interface Subscription {
    domain: string;
    channel: string;
    callback: (message: any) => void;
}

let ws: WebSocket;
const subscriptions: Map<string, Set<Subscription>> = new Map();
let currentDomain: string;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const INITIAL_RECONNECT_DELAY = 1000; // Start with 1 second

function getReconnectDelay(): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, etc. up to about 17 minutes
    return Math.min(INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts), 1000 * 60 * 17);
}

async function reconnect() {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error('Max reconnection attempts reached');
        // Could emit an event or call an error handler here
        return;
    }

    // First attempt has a small delay, subsequent attempts use exponential backoff
    const delay = reconnectAttempts === 0 ? 100 : getReconnectDelay();
    console.log(`Attempting to reconnect in ${delay/1000} seconds...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
        await connect(currentDomain);
        reconnectAttempts = 0; // Reset attempts on successful connection
        
        // Resubscribe to all channels
        for (const [key, channelSubs] of subscriptions.entries()) {
            const [domain, channel] = key.split('/');
            ws.send(JSON.stringify({
                event: 'subscribe',
                domain,
                channel
            }));
        }
    } catch (error) {
        reconnectAttempts++;
        console.error(`Reconnection attempt ${reconnectAttempts} failed:`, error);
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnect(); // Only try again if we haven't reached max attempts
        } else {
            console.error('Failed to reconnect after maximum attempts');
            // Could emit an event or call an error handler here
        }
    }
}

export function connect(origin: string): Promise<void> {
    return new Promise((resolve, reject) => {
        currentDomain = origin;
        const address = origin.replace(/^https?:\/\//, 'wss://') + '/ws';
        console.log(`Websocket address: ${address}`);
        
        try {
            ws = new WebSocket(address);
        } catch (error) {
            reject(error);
            return;
        }
        
        ws.onopen = () => {
            console.log("WebSocket connected");
            resolve();
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            reject(error);
        };

        // Handle incoming messages and route to appropriate subscribers
        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                // Handle the initial connection message
                if (message.event === 'connected') {
                    console.log('Received connection confirmation:', message);
                    return;
                }
                
                const { channel, data } = message;
                
                // Get all subscriptions for this channel
                const channelSubs = subscriptions.get(`${currentDomain}/${channel}`);
                if (channelSubs) {
                    // Notify all subscribers
                    channelSubs.forEach(sub => {
                        sub.callback(data);
                    });
                }
            } catch (error) {
                console.error('Error processing websocket message:', error);
            }
        };

        ws.onclose = (event) => {
            console.log('WebSocket connection closed', event.code, event.reason);
            if (!event.wasClean) {
                console.log('Connection died, attempting to reconnect...');
                reconnect();
            }
        };
    });
}

export function subscribe(channel: string, callback: (message: any) => void) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket is not connected');
    }

    // Create subscription object
    const subscription: Subscription = { 
        domain: currentDomain, 
        channel, 
        callback 
    };

    // Create a unique key for the subscription
    const key = `${currentDomain}/${channel}`;

    // Get or create set of subscriptions for this channel
    let channelSubs = subscriptions.get(key);
    if (!channelSubs) {
        channelSubs = new Set();
        subscriptions.set(key, channelSubs);
    }

    // Add subscription
    channelSubs.add(subscription);

    // Send subscribe message to server
    ws.send(JSON.stringify({
        event: 'subscribe',
        domain: currentDomain,
        channel
    }));

    // Return unsubscribe function
    return () => unsubscribeCallback(subscription);
}

export function unsubscribe(channel: string) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket is not connected');
    }

    const key = `${currentDomain}/${channel}`;

    // Remove all subscriptions for this channel
    if (subscriptions.has(key)) {
        subscriptions.delete(key);
        
        // Notify server about unsubscribe
        ws.send(JSON.stringify({
            event: 'unsubscribe',
            domain: currentDomain,
            channel
        }));
    }
}

// Helper function to unsubscribe a specific callback
function unsubscribeCallback(subscription: Subscription) {
    const key = `${subscription.domain}/${subscription.channel}`;
    const subs = subscriptions.get(key);
    if (subs) {
        subs.delete(subscription);
        if (subs.size === 0) {
            subscriptions.delete(key);
            // Notify server about unsubscribe
            ws.send(JSON.stringify({
                event: 'unsubscribe',
                domain: subscription.domain,
                channel: subscription.channel
            }));
        }
    }
}

export function broadcast(channel: string, message: any) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket is not connected');
    }

    ws.send(JSON.stringify({
        event: 'broadcast',
        domain: currentDomain,
        channel,
        message
    }));
}