import fastify from 'fastify';
const server = fastify({ logger: true });
import multer from 'fastify-multer';
import { pdfRoutes } from './pdfRoutes.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

server.register(multer.contentParser)
// server.register(upload.single('pdf'));
server.register(pdfRoutes);

const start = async () => {
    try {
        await server.listen({ port: 3000 });
        server.log.info(`Server running at http://localhost:3000/`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();