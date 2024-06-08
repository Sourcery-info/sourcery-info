import weaviate, { WeaviateClient, ObjectsBatcher, } from 'weaviate-ts-client';
import fetch from 'node-fetch';

const client: WeaviateClient = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
});

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
    let batcher: ObjectsBatcher = client.batch.objectsBatcher();
    let counter: number = 0;
    let batchSize: number = 100;

    for (const item of data) {
        // Construct the object to add to the batch
        const obj = {
            class: className,
            properties: [
                {
                    name: "Answer",
                    value: item.Answer,

                },
                {
                    name: "Question",
                    value: item.Question,
                },
                {
                    name: "Category",
                    value: item.Category,
                },
                {
                    name: "Vector",
                    value: item.Vector,
                },
            ],
            vector: item.Vector,
            vectorizer: "text2vec-transformers",
            moduleConfig: {
                "text2vec-transformers": {
                    vectorizeClassName: false
                }
            },
        };

        // add the object to the batch queue
        batcher = batcher.withObject(obj);

        // When the batch counter reaches batchSize, push the objects to Weaviate
        if (counter++ % batchSize === 0) {
            // Flush the batch queue and restart it
            await batcher.do();
            batcher = client.batch.objectsBatcher();
        }
    }

    // Flush the remaining objects
    await batcher.do();
    console.log(`Finished importing ${counter} objects.`);
}

// await importQuestionsWithVectors();

const question = "What are glucose?";

console.log("Asking a question");
const groupedTaskResponse = await client.graphql
    .get()
    .withClassName(className)
    .withFields("question answer category")
    .withNearText({concepts: ['biology']})
    // .withGenerate({
    //     groupedTask: question,
    // })
    .withLimit(5)
    .do();

console.log(JSON.stringify(groupedTaskResponse, null, 2));