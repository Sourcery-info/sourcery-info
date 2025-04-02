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

export enum SourcerySecurity {
    SECURE = 'secure',
    INSECURE = 'insecure'
}

export type SourceryAccount = {
    user_id: string;
    username: string;
    name: string;
    email: string;
    password: string;
    otp: string | null;
    admin: boolean;
    approved: boolean;
    date_created: string | null;
    last_login: string | null;
    avatar: string | null;
    two_factor_enabled: boolean;
}

export type SourcerySettings = {
    vector_model: string;
    chat_model: string;
    temperature: number;
    security: SourcerySecurity;
    accounts: SourceryAccount[];
}