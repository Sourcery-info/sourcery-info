import { Ollama } from "ollama";

const ollama = new Ollama({
    host: process.env.OLLAMA_URL || "http://localhost:9100",
});

export const ensure_model = async (model: string) => {
    const response = await ollama.list();
    const models = response.models;
    if (!models.map(m => m.name).includes(model)) {
        console.log(`Pulling model ${model}`)
        await ollama.pull({ model: model });
    }
}