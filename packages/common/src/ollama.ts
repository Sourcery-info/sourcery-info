import { Ollama } from "ollama";

const ollama = new Ollama({
    host: process.env.OLLAMA_URL || "http://localhost:9100",
});

const MODEL = "llama3.2:latest";

export const ensure_model = async (model: string) => {
    const response = await ollama.list();
    const models = response.models;
    if (!models.map(m => m.name).includes(model)) {
        console.log(`Pulling model ${model}`)
        await ollama.pull({ model: model });
    }
}

export const unload_model = async () => {
    await ollama.generate({ 
        model: MODEL, 
        prompt: "", 
        keep_alive: 0 
    })
}