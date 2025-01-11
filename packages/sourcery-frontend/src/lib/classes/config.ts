import { ConfigModel } from '@sourcery/common/src/models/Config.model';
import type { Config } from '@sourcery/common/types/Config.type';
import { SourceryPub } from '@sourcery/queue/src/pub.js';
import { keyNameMap } from '$lib/config/keyname_map';
import type { ZodType } from 'zod';

type KeyNameMapEntry = {
    name: string;
    type: string;
    placeholder: string;
    required: boolean;
    default: string;
    description: string;
    category: string;
    dotenv: string;
    schema: ZodType;
}

const pub = new SourceryPub(`sourcery.info-ws`);

async function pubConfig(config: Config): Promise<void> {
    pub.addJob(`config:update`, { config });
}

function mapDBConfig(config: Config): Config {
    return {
        _id: config._id?.toString(),
        key: config.key,
        value: config.value,
        created_at: config.created_at,
        updated_at: config.updated_at,
    }
}

function getEnvValue(key: string): string | null {
    const keyConfig = keyNameMap[key as keyof typeof keyNameMap];
    if (keyConfig?.dotenv) {
        const envValue = process.env[keyConfig.dotenv];
        if (envValue) {
            return envValue;
        }
    }
    return null;
}

export async function getConfigs(): Promise<Config[]> {
    const configs = await ConfigModel.find().sort({ key: 1 });
    const mappedConfigs = configs.map(config => {
        const envValue = getEnvValue(config.key);
        return mapDBConfig({
            ...config.toObject(),
            value: envValue ?? config.value
        });
    });
    return mappedConfigs;
}

export async function getConfig(key: string): Promise<Config | null> {
    const config = await ConfigModel.findOne({ key });
    if (!config) return null;

    const envValue = getEnvValue(key);
    return mapDBConfig({
        ...config.toObject(),
        value: envValue ?? config.value
    });
}

export async function createConfig(config: Omit<Config, '_id'> & { _id?: string }): Promise<Config> {
    // Don't create if it's an env variable
    const envValue = getEnvValue(config.key);
    if (envValue !== null) {
        return {
            key: config.key,
            value: envValue,
            created_at: new Date(),
            updated_at: new Date()
        };
    }

    if (config._id) {
        delete config._id;
    }
    const newConfig = await ConfigModel.create(config);
    pubConfig(newConfig);
    return mapDBConfig(newConfig);
}

export async function updateConfig(config: Config): Promise<Config> {
    // Don't update if it's an env variable
    const envValue = getEnvValue(config.key);
    if (envValue !== null) {
        return {
            key: config.key,
            value: envValue,
            created_at: new Date(),
            updated_at: new Date()
        };
    }

    const updatedConfig = await ConfigModel.findOneAndUpdate(
        { key: config.key },
        config,
        { new: true, upsert: true }
    );
    if (!updatedConfig) {
        throw new Error('Config not found');
    }
    pubConfig(updatedConfig);
    return mapDBConfig(updatedConfig);
}

export async function deleteConfig(key: string): Promise<void> {
    // Don't delete if it's an env variable
    const envValue = getEnvValue(key);
    if (envValue !== null) {
        return;
    }

    const deletedConfig = await ConfigModel.findOneAndDelete({ key });
    if (!deletedConfig) {
        throw new Error('Config not found');
    }
    pubConfig(deletedConfig);
}

export async function bulkUpdateConfigs(configs: Config[]): Promise<Config[]> {
    const operations = [];
    const results: Config[] = [];

    for (const config of configs) {
        const envValue = getEnvValue(config.key);
        if (envValue !== null) {
            // Skip DB operation for env variables but include in results
            results.push({
                key: config.key,
                value: envValue,
                created_at: new Date(),
                updated_at: new Date()
            });
            continue;
        }

        operations.push({
            updateOne: {
                filter: { key: config.key },
                update: { $set: { value: config.value } },
                upsert: true
            }
        });
    }

    if (operations.length > 0) {
        await ConfigModel.bulkWrite(operations);
    }

    // Get all configs to ensure we have the latest values
    const updatedConfigs = await getConfigs();
    updatedConfigs.forEach(config => pubConfig(config));

    return updatedConfigs;
}

export async function getConfigsByKeys(keys: string[]): Promise<Config[]> {
    const configs = await ConfigModel.find({ key: { $in: keys } }).sort({ key: 1 });
    return configs.map(config => {
        const envValue = getEnvValue(config.key);
        return mapDBConfig({
            ...config,
            value: envValue ?? config.value
        });
    });
}

export async function getDefaultConfig(key: string): Promise<string | null> {
    const keyConfig = keyNameMap[key as keyof typeof keyNameMap];
    return keyConfig?.default ?? null;
} 