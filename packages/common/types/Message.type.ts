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

import mongoose from "mongoose";
import { TChunk } from "./Chunks.type";
import { SourceryFile } from "./SourceryFile.type";

export type Message = {
    _id?: string;
    role: string;
    content: string;
    file_ids?: string[] | mongoose.Schema.Types.ObjectId[];
    chunk_ids?: string[] | mongoose.Schema.Types.ObjectId[];
    chunks?: TChunk[];
    files?: SourceryFile[];
    created_at?: Date;
    updated_at?: Date;
    error?: boolean;
    failedQuery?: string;
    __v?: number;
}
