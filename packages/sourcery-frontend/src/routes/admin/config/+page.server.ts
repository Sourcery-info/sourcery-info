import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getConfigs, bulkUpdateConfigs } from '$lib/classes/config';
import { keyNameMap } from '$lib/config/keyname_map';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { validate } from '$lib/validate';

async function populateConfig() {
    const configs = await getConfigs();

    // Create a map of existing configs
    const configMap = configs.reduce((acc, config) => {
        acc[config.key] = config.value;
        return acc;
    }, {} as Record<string, string>);

    const envVars = process.env;
    for (const [key, value] of Object.entries(keyNameMap)) {
        if (configMap[key] || (value.dotenv && envVars[value.dotenv])) {
            configMap[key] = envVars[value.dotenv] || configMap[key] || value.default;
        }
    }

    const configsByCategory = Object.entries(keyNameMap).reduce((acc, [key, value]) => {
        const category = value.category;
        if (!acc[category]) {
            acc[category] = [];
        }

        const isEnv = envVars[value.dotenv];

        acc[category].push({
            key,
            name: value.name,
            value: configMap[key],
            description: value.description,
            required: value.required,
            type: value.type,
            placeholder: value.placeholder,
            isEnv: isEnv,
        });

        return acc;
    }, {} as Record<string, any[]>);

    const configRecords = Object.entries(keyNameMap).reduce((acc, [key, value]) => {
        acc[key] = {
            key,
            name: value.name,
            value: configMap[key],
            description: value.description,
            required: value.required,
            type: value.type,
            placeholder: value.placeholder,
            isEnv: !!value.dotenv,
            schema: value.schema
        };
        return acc;
    }, {} as Record<string, any>);
    return { configMap, configsByCategory, configRecords };
}

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user?.admin) {
        throw error(403, 'Unauthorized');
    }
    const { configsByCategory } = await populateConfig();
    return {
        configsByCategory,
        user_id: locals.user._id
    };
};

export const actions = {
    default: async ({ request, locals }) => {
        if (!locals.user?.admin) {
            throw error(403, 'Unauthorized');
        }

        const formData = await request.formData();
        const { configRecords } = await populateConfig();

        const schemas = z.object(
            Object.entries(formData).reduce((acc, [key]) => {
                if (key in configRecords) {
                    const config = configRecords[key];
                    if (!config.isEnv || !process.env[config.dotenv]) {
                        acc[key] = config.schema || zfd.text(z.string());
                    }
                }
                return acc;
            }, {} as Record<string, z.ZodType>)
        );

        const validation = await validate(formData, schemas);

        if (validation.errors) {
            return fail(400, validation);
        }

        const configUpdates = [];
        for (const [key, value] of formData.entries()) {
            configUpdates.push({
                key,
                value: value.toString()
            });
        }

        try {
            if (configUpdates.length > 0) {
                await bulkUpdateConfigs(configUpdates);
            }
            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500, { message: "Failed to update config" });
        }
    }
}; 