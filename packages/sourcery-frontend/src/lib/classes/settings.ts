import { UserModel } from '@sourcery/common/src/models/User.model';
import type { SourcerySettings } from "$lib/types/SourcerySettings.type"
import { SourcerySecurity } from "$lib/types/SourcerySettings.type"

const SETTINGS_DEFAULTS: SourcerySettings = {
    vector_model: 'all-minilm:latest',
    chat_model: 'llama3:8b',
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
    
    async _get_config() {
        const user = await UserModel.findById(this.user_id);
        if (!user) throw new Error("User not found");
        
        return {
            vector_model: user.settings?.default_vector_model || SETTINGS_DEFAULTS.vector_model,
            chat_model: user.settings?.default_chat_model || SETTINGS_DEFAULTS.chat_model,
            temperature: SETTINGS_DEFAULTS.temperature,
            security: SETTINGS_DEFAULTS.security,
            accounts: SETTINGS_DEFAULTS.accounts,
        };
    }

    async _save(settings: SourcerySettings) {
        await UserModel.findByIdAndUpdate(this.user_id, {
            settings: {
                default_vector_model: settings.vector_model,
                default_chat_model: settings.chat_model,
                // Preserve other settings
                $retain: ['theme', 'language', 'notifications']
            }
        }, { new: true });
    }

    async set(settings: Partial<SourcerySettings>) {
        this.settings = { ...this.settings, ...settings };
        await this._save(this.settings);
    }

    async get(field: string | null = null) {
        this.settings = await this._get_config();
        if (field) {
            if (!(field in this.settings)) {
                return null;
            }
            return this.settings[field as keyof SourcerySettings];
        }
        return this.settings;
    }
}
