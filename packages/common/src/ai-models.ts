export type AIModelType = "embed" | "chat" | "mulitmodal" | "rerank";

export type TAIModel = {
    name: string;
    value: string;
    type: AIModelType;
    dimensions?: number;
    default?: boolean;
}

export const AIModels: TAIModel[] = [
    {
        "name": "all-MiniLM",
        "value": "all-minilm:latest",
        "type": "embed",
        "dimensions": 384
    },
    {
        "name": "Nomic Embed Text",
        "value": "nomic-embed-text",
        "type": "embed",
        "dimensions": 768,
        "default": true
    },
    {
        "name": "Llama3.2 7b",
        "value": "llama3.2:7b",
        "type": "chat",
        "default": true
    },
    {
        "name": "Deepseek R1 8b",
        "value": "deepseek-r1:8b",
        "type": "chat"
    },
    {
        "name": "Deepseek R1 7b",
        "value": "deepseek-r1:7b",
        "type": "chat"
    },
    {
        "name": "Deepseek R1 14b",
        "value": "deepseek-r1:14b",
        "type": "chat"
    },
    {
        "name": "Llama3.2 Vision 7b",
        "value": "llama3.2-vision:7b",
        "type": "mulitmodal"
    },
    {
        "name": "Llama3.2 Uncensored 3b",
        "value": "artifish/llama3.2-uncensored:3b",
        "type": "chat"
    },
    {
        "name": "BGE Reranker v2 M3",
        "value": "linux6200/bge-reranker-v2-m3",
        "type": "rerank"
    }
]