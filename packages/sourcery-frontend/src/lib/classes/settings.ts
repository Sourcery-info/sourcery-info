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

import { UserModel } from '@sourcery/common/src/models/User.model';
import type { SourcerySettings } from "$lib/types/SourcerySettings.type"
import { SourcerySecurity } from "$lib/types/SourcerySettings.type"
import { AIModels } from "@sourcery/common/src/ai-models"

const SETTINGS_DEFAULTS: SourcerySettings = {
    vector_model: AIModels.find(model => model.type === 'embed' && model.default)?.value || 'nomic-embed-text',
    chat_model: AIModels.find(model => model.type === 'chat' && model.default)?.value || 'llama3.2:7b',
    temperature: 0.1,
    security: SourcerySecurity.SECURE,
    accounts: [],
}

export class Settings {
    settings: SourcerySettings;
    user_id: string;

    constructor(user_id: string) {
        this.user_id = user_id;
        if (!this.user_id) throw new Error("User ID is required.");
        this.settings = SETTINGS_DEFAULTS;
    }
    
    async all() {
        const user = await UserModel.findById(this.user_id);
        if (!user) throw new Error("User not found");
        
        return {
            vector_model: user.settings?.vector_model || SETTINGS_DEFAULTS.vector_model,
            chat_model: user.settings?.chat_model || SETTINGS_DEFAULTS.chat_model,
            temperature: user.settings?.temperature || SETTINGS_DEFAULTS.temperature,
            security: user.settings?.security || SETTINGS_DEFAULTS.security,
            accounts: SETTINGS_DEFAULTS.accounts,
        };
    }

    async _save(settings: SourcerySettings) {
        await UserModel.findByIdAndUpdate(this.user_id, {
            settings: {
                vector_model: settings.vector_model,
                chat_model: settings.chat_model,
                temperature: settings.temperature,
                security: settings.security,
            }
        }, { new: true });
    }

    async set(settings: Partial<SourcerySettings>) {
        this.settings = { ...this.settings, ...settings };
        await this._save(this.settings);
    }

    async get(field: string | null = null) {
        this.settings = await this.all();
        if (field) {
            if (!(field in this.settings)) {
                return null;
            }
            return this.settings[field as keyof SourcerySettings];
        }
        return this.settings;
    }
}
