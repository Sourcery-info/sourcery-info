import type { Message } from './Message.type';

export type Conversation = {
    _id?: string;
    description?: string;
    project_id?: string;
    user_id?: string;
    messages?: Message[];
    created_at?: Date;
    updated_at?: Date;
}
