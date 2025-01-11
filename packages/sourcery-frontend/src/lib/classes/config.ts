import { ConfigModel } from '@sourcery/common/src/models/Config.model';
import type { Config } from '@sourcery/common/types/Config.type';
import { SourceryPub } from '@sourcery/queue/src/pub.js';

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

export async function getConfigs(): Promise<Config[]> {
    const configs = await ConfigModel.find().sort({ key: 1 });
    return configs.map(mapDBConfig);
}

export async function getConfig(key: string): Promise<Config | null> {
    const config = await ConfigModel.findOne({ key });
    return config ? mapDBConfig(config) : null;
}

export async function createConfig(config: Omit<Config, '_id'> & { _id?: string }): Promise<Config> {
    if (config._id) {
        delete config._id;
    }
    const newConfig = await ConfigModel.create(config);
    pubConfig(newConfig);
    return mapDBConfig(newConfig);
}

export async function updateConfig(config: Config): Promise<Config> {
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
    const deletedConfig = await ConfigModel.findOneAndDelete({ key });
    if (!deletedConfig) {
        throw new Error('Config not found');
    }
    pubConfig(deletedConfig);
}

export async function bulkUpdateConfigs(configs: Config[]): Promise<Config[]> {
    const operations = configs.map(config => ({
        updateOne: {
            filter: { key: config.key },
            update: { $set: { value: config.value } },
            upsert: true
        }
    }));

    await ConfigModel.bulkWrite(operations);
    
    // Fetch and return the updated configs
    const updatedConfigs = await getConfigs();
    updatedConfigs.forEach(config => pubConfig(config));
    
    return updatedConfigs;
}

export async function getConfigsByKeys(keys: string[]): Promise<Config[]> {
    const configs = await ConfigModel.find({ key: { $in: keys } }).sort({ key: 1 });
    return configs.map(mapDBConfig);
} 