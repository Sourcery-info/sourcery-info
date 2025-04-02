// Copyright (C) 2025 Jason Norwood-Young
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
