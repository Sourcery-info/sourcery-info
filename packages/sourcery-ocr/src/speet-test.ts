import ollama from "ollama";
import fs from "fs";

async function main() {
    // Read the image file and convert to base64
    const imageBuffer = fs.readFileSync("/home/jason/Development/docling/tests/eskom/png/eskom-006.png");
    const base64Image = imageBuffer.toString('base64');

    const response = await ollama.generate({
        model: "llama3.2-vision",
        prompt: "Transform all the text in this image into Markdown format. Do not leave any text out. Do not add other commentary.",
        images: [`${base64Image}`]
    });
    console.log(response);
}

main();