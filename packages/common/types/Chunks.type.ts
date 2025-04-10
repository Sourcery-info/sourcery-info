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

import type { Entity } from "./Entities.type";

// Define type for chunk
export type TChunk = {
    id?: string;
    _id?: string;
    file_id?: string;
    title: string;
    level: number;
    content: string;
    parent: string | null;
    children: TChunk[] | null;
    vector?: number[];
    context?: string;
    created_at?: Date;
    updated_at?: Date;
    tokens?: number;
    entities?: Entity[];
    __v?: number; // Document version
}