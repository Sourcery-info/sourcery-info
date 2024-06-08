import { SourceryWorker } from "../src/worker";
import { SourceryQueue } from "../src/queue";

let worker: SourceryWorker;
let queue: SourceryQueue;

async function awaitQueueResponse(queue: SourceryQueue, jobName: string, data: any) {
    return new Promise((resolve, reject) => {
        worker = new SourceryWorker(async (data: any) => {
            resolve(data);
        });
        queue.addJob(jobName, data);
    });
}

describe("Test message queue", () => {
    afterAll(async () => {
        if (worker) await worker.close();
        if (queue) await queue.close();
    })
    test('test sending and receiving a message', async () => {
        queue = new SourceryQueue();
        const response = await awaitQueueResponse(queue, 'test', {foo: 'bar'});
        expect(response).toEqual({foo: 'bar'});
    });
});