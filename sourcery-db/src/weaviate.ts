import weaviate, {  } from "weaviate-ts-client";
import restify from "restify";

const writeClient = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080'
}

    // new EmbeddedOptions({
        // port: 6668,
    // })
);

// const readClient = weaviate.client(
//     new EmbeddedOptions({
//         port: 6666,
//     })
// );

await writeClient.embedded.start();

// const server = restify.createServer()
// server.use(restify.plugins.bodyParser())

// server.post('/init/:project_name', async (req, res) => {
//     const projectName = req.params.project_name
//     const classSchema = {
//         class: 'Document',
//         vectorizer: "none",
//         properties: [
//             {
//                 name: 'filename',
//                 dataType: ['string']
//             },
//             {
//                 name: 'content',
//                 dataType: ['text']
//             },
//             {
//                 name: 'entities',
//                 dataType: ['string']
//             },
//             {
//                 name: 'createdAt',
//                 dataType: ['date']
//             },
//             {
//                 name: 'updatedAt',
//                 dataType: ['date']
//             },
//             {
//                 name: 'author',
//                 dataType: ['Person']
//             },
//         ]
//     }
// });

// const response = await writeC.data
//     .creator()
//     .withClassName('Person')
//     .withProperties({ name: 'John Doe' })
//     .do()

// console.log(response)

const className = "JeopardyQuestion";

type JeopardyItem = {
    Answer: string;
    Question: string;
    Category: string;
    Vector: number[];
};

async function getJsonData(): Promise<JeopardyItem[]> {
    const file = await fetch(
        "https://raw.githubusercontent.com/weaviate-tutorials/quickstart/main/data/jeopardy_tiny+vectors.json"
    );
    return file.json() as unknown as JeopardyItem[];
}

async function importQuestionsWithVectors() {
    // Get the questions directly from the URL
    const data = await getJsonData();

    // Prepare a batcher. Even though this dataset is tiny, this is the best practice for import.
    let batcher: ObjectsBatcher = writeClient.batch.objectsBatcher();
    let counter: number = 0;
    let batchSize: number = 100;

    for (const item of data) {
        // Construct the object to add to the batch
        const obj = {
            class: className,
            properties: {
                answer: item.Answer,
                question: item.Question,
                category: item.Category,
            },
            vector: item.Vector,
        };

        // add the object to the batch queue
        batcher = batcher.withObject(obj);

        // When the batch counter reaches batchSize, push the objects to Weaviate
        if (counter++ % batchSize === 0) {
            // Flush the batch queue and restart it
            await batcher.do();
            batcher = writeClient.batch.objectsBatcher();
        }
    }

    // Flush the remaining objects
    await batcher.do();
    console.log(`Finished importing ${counter} objects.`);
}

await importQuestionsWithVectors();

// await writeClient.embedded.stop();

// await readClient.embedded.start();
// Ask a question

const question = "What are glucose?";

console.log("Asking a question");
const groupedTaskResponse = await writeClient.graphql
    .get()
    .withClassName(className)
    .withFields("question")
    .withLimit(5)
    // .withGenerate({
    //     groupedTask: question,
    // })
    .do();

console.log(groupedTaskResponse);

// await readClient.embedded.stop();
