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

import { Ollama } from "ollama";
import { logger } from "./logger";

const ollama = new Ollama({
    host: process.env.OLLAMA_URL || "http://localhost:9100",
});

const MODEL = "llama3.2:latest";

export const ensure_model = async (model: string) => {
    const response = await ollama.list();
    const models = response.models;
    if (!models.map(m => m.name).includes(model)) {
        logger.info({ msg: `Pulling model ${model}`, tags: ['ollama', 'info'] });
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