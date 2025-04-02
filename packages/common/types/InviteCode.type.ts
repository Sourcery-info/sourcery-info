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

export interface InviteCode {
    _id: string;
    email: string;
    code: string;
    membership_id: string;
    was_emailed: boolean;
    expires_at: Date;
    used: boolean;
    used_at?: Date;
    created_at: Date;
}

export interface CreateInviteCodeInput {
    email: string;
    membership_id: string;
    send_email: boolean;
} 