import request from "superwstest";
import { wssWebserver as server } from "../src/ws";

describe("WebSocket Server", () => {
    beforeEach((done) => {
        server.listen(0, "localhost", done);
    });

    afterEach((done) => {
        server.close(done);
    });

    it("should establish a WebSocket connection", async () => {
        await request(server)
        .ws('/path/ws')
        .expectJson( {"response":"echo hello"})
        .sendText(JSON.stringify({ cmd: "echo", data: "hello" }))
        .close()
        .expectClosed();
    });

    it("should chat to llama2", async () => {
        const query = {
            cmd: "chat",
            data: {
                model: "llama2",
                system: "talk like a pirate",
                prompt: "What is the airspeed velocity of an unladen swallow?",
                stream: false,
            }
        }
        await request(server)
        .ws('/path/ws')
        .expectText('hello')
        .sendText(JSON.stringify(query))
        .expectText('echo llama2')
        .close()
        .expectClosed();
    })
});
