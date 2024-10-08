import { server } from "../src/sourcery-ocr-api-server";
import { easyocr } from "../src/easyocr";
import { imconvert } from "../src/imconvert";
import { processPdf } from "../src/processPDF";
import fs from "fs";

describe("sourcery-ocr-api", function () {
    it("should return a 200 status code", async function () {
        const response = await server.inject({
            method: "GET",
            url: "/",
        });
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ hello: "world" });
        expect(response.headers["content-type"]).toBe("application/json; charset=utf-8");
    });
});

// describe("imconvert", function () {
//     it("should convert a PDF to PNG", async function () {
//         const result = await imconvert("./test/saconstitution-web-eng-cut.pdf", "./output")
//         console.log(result)
//         const result_file = fs.readFileSync("/tmp/saconstitution-web-eng-01.png", "base64");
//         expect(result_file).not.toBeNull();
//     }, 30000);
// })

describe("processPdf", function () {
    it("should convert a PDF to text", async function () {
        const result = await processPdf("./test/saconstitution-web-eng-cut.pdf")
        console.log(result)
        expect(result).not.toBeNull();
    }, 30000);
})