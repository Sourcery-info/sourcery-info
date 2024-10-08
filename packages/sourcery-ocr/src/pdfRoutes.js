import { streamConvertPdfToText } from "./convertPdfToText.js";
import multer from 'fastify-multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export async function pdfRoutes(fastify, options) {
    fastify.post('/convert', async (req, reply) => {
        server.register(upload.single('pdf'));
        reply.raw.setHeader('Content-Type', 'application/json');
        streamConvertPdfToText(req, reply);
    });
}