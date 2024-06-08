import { PROJECT_DIR } from "$lib/variables"
import type { SourcerySettings } from "$lib/types/SourcerySettings.type"
import { SourcerySecurity } from "$lib/types/SourcerySettings.type"
import fs from 'fs';

const SETTINGS_DEFAULTS: SourcerySettings = {
    vector_model: 'all-minilm:latest',
    chat_model: 'llama3:8b',
    temperature: 0.1,
    security: SourcerySecurity.SECURE,
}

export class Settings {
    settings: SourcerySettings;

    constructor() {
        if (!fs.existsSync(PROJECT_DIR)) {
            fs.mkdirSync(PROJECT_DIR);
        }
        if (!fs.existsSync(`${PROJECT_DIR}/settings.json`)) {
            this._save(SETTINGS_DEFAULTS);
        }
        this.settings = this._get_config();
    }
    
    _get_config() {
        const data = fs.readFileSync(`${PROJECT_DIR}/settings.json`, 'utf8');
        return JSON.parse(data);
    }

    

    _save(settings: SourcerySettings) {
        fs.writeFileSync(`${PROJECT_DIR}/settings.json`, JSON.stringify(settings, null, 4));
    }

    set(settings: SourcerySettings) {
        this.settings = settings;
        this._save(settings);
    }

    get() {
        return this.settings;
    }
}