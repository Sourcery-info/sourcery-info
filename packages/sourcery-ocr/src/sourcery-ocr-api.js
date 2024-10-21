import fastify from 'fastify';
const server = fastify({ logger: true });
// import multer from 'fastify-multer';
import { ocrRoutes } from './ocrRoutes.js';

// server.register(multer.contentParser)
// server.register(upload.single('pdf'));
server.register(ocrRoutes);

const start = async () => {
    try {
        await server.listen({ port: 3000, host: '0.0.0.0' });
        server.log.info(`Server running at http://0.0.0.0:3000/`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();