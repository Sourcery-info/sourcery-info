// Copyright (C) 2025 Jason Norwood-Young
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
