export type AIModelType = "embed" | "chat" | "mulitmodal";

export type TAIModel = {
    name: string;
    value: string;
    type: AIModelType;
    dimensions?: number;
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
        "dimensions": 768
    },
    {
        "name": "Llama3.2 7b",
        "value": "llama3.2:7b",
        "type": "chat"
    },
    {
        "name": "Llama3.2 Vision 7b",
        "value": "llama3.2-vision:7b",
        "type": "mulitmodal"
    }
]