import fetch from "node-fetch";

export interface RerankRequest {
    question: string;
    documents: string[];
    top_k?: number;
}

export interface RerankResponse {
    ranked_documents: {
        document: string;
        score: number;
    }[];
}

export async function rerank(
    question: string,
    documents: string[],
    top_k: number = 5
): Promise<RerankResponse> {
    const response = await fetch(`http://sourcery-reranking:8000/rank`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, documents, top_k }),
    });
    return response.json();
}

export interface UnloadResponse {
    status: "success" | "error";
    message: string;
}

export async function unload_reranker(): Promise<UnloadResponse> {
    const response = await fetch(`http://sourcery-reranking:8000/unload`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response.json();
}
