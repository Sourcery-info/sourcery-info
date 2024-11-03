import * as dotenv from "dotenv";
import { Queue } from "bullmq";

dotenv.config();

export class SourceryPub {
    protected queue: Queue;

    constructor(queue_name: string = "sourcery.info") {
        if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
            throw new Error("Please provide REDIS_HOST and REDIS_PORT");
        }
        this.queue = new Queue(queue_name, {
            connection: {
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT),
            },
        });
    }

    async addJob(jobName: string, data: any) {
        await this.queue.add(jobName, data);
    }

    async close() {
        await this.queue.close();
    }
}
