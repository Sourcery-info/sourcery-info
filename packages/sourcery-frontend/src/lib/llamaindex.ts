import { VectorStoreIndex, storageContextFromDefaults, Ollama, serviceContextFromDefaults, VectorIndexRetriever, RetrieverQueryEngine } from "llamaindex";
import type { StorageContext, ServiceContext } from "llamaindex";
import { SimpleDirectoryReader } from "llamaindex/readers/SimpleDirectoryReader";

export class LLMIndex {
    index_dir: string;
    index: VectorStoreIndex | undefined; // Initialize 'index' property
    storageContext: StorageContext | undefined;
    serviceContext: ServiceContext | undefined;

    constructor(index_dir: string) {
        this.index_dir = index_dir;
    }

    async init() {
        console.log("Initializing LLMIndex")
        this.storageContext = await storageContextFromDefaults({
            persistDir: this.index_dir
        });
        const ollamaLLM = new Ollama({ model: "llama2", temperature: 0.2 });
        const ollamaEmbed = new Ollama({ model: "llama2" });
        this.serviceContext = serviceContextFromDefaults({ 
            llm: ollamaLLM,
            embedModel: ollamaEmbed
        });
        // await this.load_index();
    }
    
    async index_documents(document_dir: string) {
        const reader = new SimpleDirectoryReader();
        const documents = await reader.loadData(document_dir);
        console.log("Indexing documents")
        await VectorStoreIndex.fromDocuments(documents, { 
            storageContext: this.storageContext,
            serviceContext: this.serviceContext
        });
        await this.load_index();
    }
    
    async load_index() {
        this.index = await VectorStoreIndex.init({ 
            storageContext: this.storageContext,
            serviceContext: this.serviceContext
        });
    }
    
    async query(query: string) {
        if (!this.index) {
            throw new Error("Index not loaded");
        }
        const retriever = new VectorIndexRetriever({
            index: this.index,
            similarityTopK: 5
        });
        const queryEngine = new RetrieverQueryEngine(retriever);
        return await queryEngine.query({ 
            query 
        });
    }
}