import request from "supertest";
import { httpServer } from "../src/app.js";

describe("HTTP Server", () => {
    it("should respond to a GET request", async () => {
        await request(httpServer)
        .get("/test")
        .expect(200, { str: "Hello, World!" });
    });

    it("should get a stream of characters over time", async () => {
        const response = await request(httpServer)
        .post("/chat/test")
        .send({ input: "Hello, World!" })
        .on("response", (res) => {
            console.log(res.text);
        })
        .expect(200);
        // console.log(response.text);
        expect(response.text).toMatch(/^[a-z]{100}$/);
    }, 12000);
});

// describe("Chat Engine", () => {
//     it("should respond to a chat query", async () => {
//         const response = await request(httpServer)
//         .get("/chat_test")
//         .expect(200);
//         expect(response.text.length).toBeGreaterThan(10);
//     }, 240000);
// });
