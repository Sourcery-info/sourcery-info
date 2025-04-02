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

import type { SourceryFile } from './SourceryFile.type';

export type Project = {
    _id: string;
    urlid: string | null;
    name: string;
    description?: string;
    notes?: string;
    owner: string;
    owner_username?: string;
    owner_name?: string;
    is_public: boolean;
    shared_with?: string[];
    created_at: Date | null;
    updated_at: Date | null;
    vector_model: string;
    chat_model: string;
    temperature: number;
    tags?: string;
    security: string;
    conversations?: string[];
    files?: SourceryFile[];
    __v?: number; // Document version
}