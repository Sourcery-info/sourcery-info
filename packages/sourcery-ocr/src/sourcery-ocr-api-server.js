import Fastify from "fastify";

export const server = Fastify({ logger: true });

server.get("/", async (request, reply) => {
    reply.send({ hello: "world" });
});