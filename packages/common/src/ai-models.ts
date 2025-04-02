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
        "name": "Llama3.2 3b",
        "value": "llama3.2:3b",
        "type": "chat",
        "default": true
    },
    {
        "name": "Deepseek R1 8b",
        "value": "deepseek-r1:8b",
        "type": "chat"
    },
    // {
    //     "name": "Deepseek R1 7b",
    //     "value": "deepseek-r1:7b",
    //     "type": "chat"
    // },
    // {
    //     "name": "Deepseek R1 14b",
    //     "value": "deepseek-r1:14b",
    //     "type": "chat"
    // },
    // {
    //     "name": "Llama3.2 Vision 7b",
    //     "value": "llama3.2-vision:7b",
    //     "type": "mulitmodal"
    // },
    // {
    //     "name": "Llama3.2 Uncensored 3b",
    //     "value": "artifish/llama3.2-uncensored:3b",
    //     "type": "chat"
    // },
    {
        "name": "BGE Reranker v2 M3",
        "value": "linux6200/bge-reranker-v2-m3",
        "type": "rerank"
    }
]