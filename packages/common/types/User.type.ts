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

import type { Membership } from './Membership.type';

export type User = {
    _id: string;
    user_id?: string;
    email: string;
    name: string;
    username: string;
    password_hash: string;
    password?: string;
    created_at: Date;
    updated_at: Date;
    approved: boolean;
    admin: boolean;
    two_factor_enabled: boolean;
    two_factor_secret?: string;
    two_factor_backup_codes?: string[];
    settings?: UserSettings;
    membership_id?: Array<string>;
    memberships?: Array<Membership>;
    __v?: number; // Document version
}

export type UserSettings = {
    theme?: string;
    language?: string;
    notifications?: boolean;
    default_vector_model?: string;
    default_chat_model?: string;
    [key: string]: any;
}