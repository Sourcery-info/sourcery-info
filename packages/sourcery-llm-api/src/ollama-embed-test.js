import { OllamaEmbedding, Ollama, Document, VectorStoreIndex, serviceContextFromDefaults, QdrantVectorStore } from "llamaindex";

const embedModel = new OllamaEmbedding({ model: "nomic-embed-text" });
const essay = "The meaning of life is a philosophical question concerning the significance of living or existence in general. It can also be expressed in different forms, such as 'What is the purpose of life?', 'What is the nature of life?', 'What is the significance of life?' and 'What is the value of life?'.";
const document = new Document({ text: essay, id_: "essay" });
const llm = new Ollama({
    model: "llama3:8b"
});
const serviceContext = new serviceContextFromDefaults({
    embedModel,
    llm,
});

const vectorStore = new QdrantVectorStore({
    serviceContext,
    url: process.env.QDRANT_URL || "http://localhost:6333",
    collectionName: "ollama-embed-test",
});

const index = await VectorStoreIndex.fromVectorStore(vectorStore);

index.addDocument(document);
index.buildIndex();
