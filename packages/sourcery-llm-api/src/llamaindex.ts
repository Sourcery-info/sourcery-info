// example.ts
import { Response } from "restify"
import {
    Document,
    VectorStoreIndex,
    QdrantVectorStore,
    Ollama,
    OllamaEmbedding,
    serviceContextFromDefaults,
    ContextChatEngine,
    ServiceContext,
    SimpleNodeParser,
    SimpleDirectoryReader,
    TextFileReader,
    PDFReader,
    PapaCSVReader,
    DocxReader,
} from "llamaindex";
import { readDir } from "./llamaindex_files";
import dotenv from "dotenv";

dotenv.config();

export class SouceryLlamaIndex {
    ollama: Ollama;
    embedModel: OllamaEmbedding | undefined;
    serviceContext: ServiceContext;
    index: VectorStoreIndex | undefined;
    chatEngine: ContextChatEngine | undefined;
    vectorStore: QdrantVectorStore | undefined;
    retriever: any;
    
    constructor(project: string) {
        // Set environment variable OPENAI_API_KEY
        // process.env.OPENAI_API_KEY = "blah";
        this.ollama = new Ollama({ 
            model: "llama3.2:latest",
            temperature: 0.2,
            baseURL: process.env.LLAMA_API_URL || "http://localhost:9100",
        });
        this.embedModel = new OllamaEmbedding({
            model: "all-minilm",
            // temperature: 0.2,
            // baseURL: process.env.LLAMA_API_URL || "http://localhost:9100",
        });
        const node_parser = new SimpleNodeParser({
            chunkSize: 512,
            chunkOverlap: 32
        });
        this.serviceContext = serviceContextFromDefaults({ 
            llm: this.ollama,
            nodeParser: node_parser,
            embedModel: this.embedModel
        });
        this.vectorStore = new QdrantVectorStore({
            url: process.env.QDRANT_URL || "http://localhost:6333",
            collectionName: project + "-v1",
        });
    }

    async get_retriever() {
        console.time("Index");
        if (!this.vectorStore) {
            throw new Error("Vector store not set up");
        }
        const index = await VectorStoreIndex.fromVectorStore(this.vectorStore, this.serviceContext);
        console.timeEnd("Index");

        // Create retriever
        console.time("Retriever");
        const retriever = index.asRetriever({
            similarityTopK: 5,
        });
        this.retriever = retriever;
        console.timeEnd("Retriever");
        return retriever;
    }

    // async indexFile(filename: string) {
    //     console.time("Index");
    //     // Insert document into vector store
    //     if (!this.index) {
    //         throw "Index not initialized";
    //     }
    //     const reader = new SimpleDirectoryReader();
    //     const documents = await reader.loadData({
    //         directoryPath: filename,
    //         defaultReader: new TextFileReader(),
    //         fileExtToReader: {
    //             pdf: new PDFReader(),
    //             csv: new PapaCSVReader(),
    //             docx: new DocxReader(),
    //         },
    //     });
    //     for (let document of documents) {
    //         await this.index.insert(document);
    //     }
    //     console.timeEnd("Index");
    // }

    async indexDocuments(documents: Document[]) {
        console.time("Index");
        if (!this.vectorStore) {
            throw new Error("Vector store not set up");
        }
        const index = await VectorStoreIndex.fromVectorStore(this.vectorStore, this.serviceContext);
        // Insert document into vector store
        let i = 1;
        for (let document of documents) {
            console.log(`Inserting ${i++} of ${documents.length}`);
            await index.insert(document);
        }
        console.timeEnd("Index");
    }

    async indexDirectory(dir: string) {
        const documents = await readDir(dir);
        if (!this.vectorStore) {
            throw new Error("Vector store not set up");
        }
        const index = await VectorStoreIndex.fromVectorStore(this.vectorStore, this.serviceContext);
        console.time("documentIndex");
        let i = 1;
        for (let document of documents) {
            console.log(`Inserting ${i++} of ${documents.length} (document: ${document.id_})`);
            await index.insert(document);
        }
        console.timeEnd("documentIndex");
    }

    async retrieveDocuments(query: string) {
        if (!this.vectorStore) {
            throw new Error("Vector store not set up");
        }
        console.time("Retrieve");
        const retriever = await this.get_retriever();
        const results = await retriever.retrieve({
            query: query,
        });
        console.timeEnd("Retrieve");
        return results;
    }

    async streamChat(query: string, stream: Response) {
        const retriever = await this.get_retriever();
        console.time("Chat Engine");
        const chatEngine = new ContextChatEngine({
            retriever,
            chatModel: this.ollama,
        });
        console.timeEnd("Chat Engine");
        console.log(retriever)
        const chatStream = await chatEngine.chat({ 
            message: query, 
            stream: true,
        });
        let response_log = [];
        console.time("Chat");
        for await (const response of chatStream) {
            // console.log(response);
            stream.write(response.response);
            response_log.push(response.response);
        }
        stream.end();
        console.timeEnd("Chat");
        // console.log(response_log);
    }

    async syncChat(query: string) {
        const retriever = await this.get_retriever();
        console.time("Chat Engine");
        const chatEngine = new ContextChatEngine({
            retriever,
            chatModel: this.ollama,
        });
        console.timeEnd("Chat Engine");
        const response = await chatEngine.chat({ 
            message: query, 
            stream: false,
        });
        return response;
    }

}

