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
import type { SourceryAccount } from "$lib/types/SourcerySettings.type";
import type { User } from "@sourcery/common/types/User.type";
import { hashPassword, checkPassword } from "$lib/utils/crypto";

export async function getUsers(): Promise<SourceryAccount[]> {
    const users = await UserModel.find({});
    return users.map(user => ({
        user_id: user._id.toString(),
        username: user.username,
        name: user.name,
        email: user.email,
        password: user.password_hash,
        admin: user.admin || false,
        approved: user.approved || false,
        date_created: user.created_at.toISOString(),
        last_login: user.settings?.last_login || null,
        avatar: user.settings?.avatar,
        otp: user.settings?.otp || '',
        two_factor_enabled: user.two_factor_enabled || false,
    }));
}

export async function getUser(user_id: string): Promise<SourceryAccount | null> {
    const user = await UserModel.findById(user_id);
    if (!user) {
        return null;
    }
    return {
        user_id: user._id.toString(),
        username: user.username,
        name: user.name,
        email: user.email,
        password: user.password_hash,
        admin: user.admin || false,
        approved: user.approved || false,
        date_created: user.created_at.toISOString(),
        last_login: user.settings?.last_login || null,
        avatar: user.settings?.avatar,
        otp: user.settings?.otp || '',
        two_factor_enabled: user.two_factor_enabled || false,
    };
}

export async function getUserCount(): Promise<number> {
    const count = await UserModel.countDocuments();
    return count;
}

export async function createUser(account: SourceryAccount) {
    const hashedPassword = await hashPassword(account.password);
    await UserModel.create({
        username: account.username,
        name: account.name,
        email: account.email,
        password_hash: hashedPassword,
        settings: {
            admin: account.admin,
            approved: account.approved,
            avatar: account.avatar,
            otp: account.otp
        }
    });
}

export async function checkUniqueUsername(username: string, user_id: string | null = null) {
    const user = await UserModel.findOne({ email: username });
    if (user_id && user?._id.toString() === user_id) {
        return true;
    }
    return !user;
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

export async function updateUser(_id: string, user: User) {
    const existingUser = await UserModel.findById(_id);
    if (!existingUser) {
        return null;
    }
    const data: Partial<User> = {
        email: user.email || existingUser.email,
        admin: user.admin || existingUser.admin,
        name: user.name || existingUser.name,
        username: user.username || existingUser.username,
        approved: user.approved || existingUser.approved
    }
    if (user.password) {
        data.password_hash = await hashPassword(user.password);
    }
    return await UserModel.findByIdAndUpdate(_id, data);
}