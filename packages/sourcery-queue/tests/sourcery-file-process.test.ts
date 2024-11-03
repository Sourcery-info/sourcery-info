import { SourcerySub } from "../src/sub";
import { SourceryPub } from "../src/pub";

let worker: SourcerySub;
let queue: SourceryPub;

async function awaitQueueResponse(queue: SourceryPub, jobName: string, data: any) {
    return new Promise((resolve, reject) => {
        worker = new SourcerySub(async (data: any) => {
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
        queue = new SourceryPub();
        const response = await awaitQueueResponse(queue, 'test', {foo: 'bar'});
        expect(response).toEqual({foo: 'bar', channel: 'test'});
    });
});