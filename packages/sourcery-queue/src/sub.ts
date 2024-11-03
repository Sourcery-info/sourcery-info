import * as dotenv from "dotenv";
import { Worker } from "bullmq";

dotenv.config();

export class SourcerySub {
    protected worker: Worker;

    constructor(fn: Function, queue_name: string = "sourcery.info") {
        if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
            throw new Error("Please provide REDIS_HOST and REDIS_PORT");
        }
        this.worker = new Worker(
            queue_name,
            async (job) => {
                job.data.channel = job.name;
                return await fn(job.data);
            },
            {
                connection: {
                    host: process.env.REDIS_HOST,
                    port: parseInt(process.env.REDIS_PORT),
                },
            }
        );
    }

    async close() {
        await this.worker.close();
    }
}
