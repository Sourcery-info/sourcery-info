# Sourcery WS

A client and server for websockets.

## Usage

```typescript
import { subscribe, unsubscribe, ping, wait_for_connection } from "./client.ts";
import { emit } from "./server.ts";

await ping();

await subscribe("channel1", (message) => {
    console.log("Message received:", message);
});

await subscribe("channel1", (message) => {
    // We cannot subscribe to the same channel twice
    console.log("Message received again:", message);
});

await subscribe("channel2", (message) => {
    console.log("Message received:", message);
});

await unsubscribe("channel1");

// Sending data to server
setInterval(() => {
    emit("channel1", "This is Channel 1");
    emit("channel2", "This is Channel 2");
}, 1000);

/* Output: 
Received pong
Message received: This is Channel 2
Message received: This is Channel 2
Message received: This is Channel 2
...
*/
```
