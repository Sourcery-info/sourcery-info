export enum SourcerySecurity {
    SECURE = 'secure',
    INSECURE = 'insecure'
}

export type SourcerySettings = {
    vector_model: string;
    chat_model: string;
    temperature: number;
    security: SourcerySecurity;
}