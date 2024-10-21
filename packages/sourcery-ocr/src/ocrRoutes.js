import { convertPdfToText } from "./convertPdfToText.js";
import { File } from "@sourcery/common/src/file.ts";

export async function ocrRoutes(fastify, options) {
    fastify.post('/ocr', async (req, res) => {
        const { project, filename } = req.body;
        console.log(req.body);
        const result = await convertPdfToText(filename);
        res.header('Content-Type', 'application/json');
        res.send(result);
    });
}