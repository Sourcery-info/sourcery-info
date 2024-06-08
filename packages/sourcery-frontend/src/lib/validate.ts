import type { Schema } from "zod";

export function validate(formData: FormData, schema: Schema) {
    const result = schema.safeParse(formData);
    if (!result.success) {
        return {
            data: Object.fromEntries(formData),
            errors: result.error.flatten().fieldErrors
        }
    }
    return { data: schema.parse(formData) };
}