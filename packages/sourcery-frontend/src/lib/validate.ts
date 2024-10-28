import type { Schema } from "zod";

export async function validate(formData: FormData, schema: Schema) {
    const result = await schema.safeParseAsync(formData);
    if (!result.success) {
        return {
            data: Object.fromEntries(formData),
            errors: result.error.flatten().fieldErrors
        }
    }
    return { data: await schema.parseAsync(formData) };
}