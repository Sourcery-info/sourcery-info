import { LLMIndex } from "../src/lib/llamaindex";

async function main() {
    const llmindex = new LLMIndex('./sample-index');
    await llmindex.init();
    // await llmindex.index_documents('./sample-docs');
    await llmindex.load_index();
    console.log(await llmindex.query('What is the Alliance?'));
}

main();