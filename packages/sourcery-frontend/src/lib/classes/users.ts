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

import { UserModel } from '@sourcery/common/src/models/User.model';
import type { User } from '@sourcery/common/types/User.type';
import type { Membership } from '@sourcery/common/types/Membership.type';
import { SourceryPub } from '@sourcery/queue/src/pub.js';
const pub = new SourceryPub(`sourcery.info-ws`);
import { hashPassword, checkPassword } from "$lib/utils/crypto";

async function pubUser(user: User): Promise<void> {
    if (!user._id) {
        return;
    }
    const user_db = await getUser(user._id);
    pub.addJob(`${user_db._id}:user`, { user: user_db });
}

function mapDBUser(user: User & { memberships?: Array<Membership | string> }): User {
    return {
        _id: user._id?.toString(),
        email: user.email,
        name: user.name,
        username: user.username,
        password_hash: user.password_hash,
        created_at: user.created_at,
        updated_at: user.updated_at,
        approved: user.approved,
        admin: user.admin,
        membership_id: user.membership_id?.map(m => m.toString()),
        two_factor_enabled: user.two_factor_enabled,
        two_factor_secret: user.two_factor_secret,
        two_factor_backup_codes: user.two_factor_backup_codes
    }
}

export async function getUserCount(): Promise<number> {
    return await UserModel.countDocuments();
}

export async function getUsers(): Promise<User[]> {
    const users = await UserModel.find().sort({ created_at: -1 });
    return users.map(mapDBUser);
}

export async function getUser(user_id: string): Promise<User> {
    const user = await UserModel.findById(user_id);
    if (!user) {
        throw new Error('User not found');
    }
    return mapDBUser(user);
}

export async function createUser(user: Omit<User, '_id' | 'password_hash' | 'created_at' | 'updated_at'>): Promise<User> {
    if (!user.password) {
        throw new Error('Password is required');
    }
    const hashedPassword = await hashPassword(user.password);
    const newUser = await UserModel.create({
        ...user,
        password_hash: hashedPassword
    });
    pubUser(newUser);
    return mapDBUser(newUser);
}

export async function updateUser(user: User): Promise<User> {
    const updatedUser = await UserModel.findByIdAndUpdate(user._id, user, { new: true });
    if (!updatedUser) {
        throw new Error('User not found');
    }
    pubUser(updatedUser);
    return mapDBUser(updatedUser);
}

export async function deleteUser(user_id: string): Promise<void> {
    const deletedUser = await UserModel.findByIdAndDelete(user_id);
    if (!deletedUser) {
        throw new Error('User not found');
    }
    pubUser(deletedUser);
}

export async function checkUniqueUsername(username: string, user_id: string | null = null): Promise<boolean> {
    const existingUser = await UserModel.findOne({ username });
    if (user_id && existingUser?._id.toString() === user_id) {
        return true;
    }
    return !existingUser;
}

export async function checkUniqueEmail(email: string, user_id: string | null = null): Promise<boolean> {
    const existingUser = await UserModel.findOne({ email });
    if (user_id && existingUser?._id.toString() === user_id) {
        return true;
    }
    return !existingUser;
} 

export async function checkUserCredentials(username: string, password: string) {
    const user = await UserModel.findOne({ $or: [{ email: username }, { username: username }] });
    if (!user) {
        return false;
    }
    if (await checkPassword(password, user.password_hash)) {
        return user._id.toString();
    }
    return false;
}