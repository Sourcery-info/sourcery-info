# Sourcery WS

Sourcery.info's websocket server and client.

## Usage

```typescript
import { subscribe, unsubscribe, ping } from "./client.ts";

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
```
