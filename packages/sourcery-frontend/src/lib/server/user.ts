import { UserModel } from '@sourcery/common/src/models/User.model';
import type { SourceryAccount } from "$lib/types/SourcerySettings.type";
import { hashPassword, checkPassword } from "$lib/utils/crypto";

export async function getUsers(): Promise<SourceryAccount[]> {
    const users = await UserModel.find({});
    return users.map(user => ({
        user_id: user._id.toString(),
        username: user.email,
        password: user.password_hash,
        admin: user.admin || false,
        approved: user.approved || false,
        date_created: user.created_at.toISOString(),
        last_login: user.settings?.last_login || null,
        avatar: user.settings?.avatar,
        otp: user.settings?.otp || '',
    }));
}

export async function getUser(user_id: string): Promise<SourceryAccount | null> {
    const user = await UserModel.findById(user_id);
    if (!user) {
        return null;
    }
    return {
        user_id: user._id.toString(),
        username: user.email,
        password: user.password_hash,
        admin: user.admin || false,
        approved: user.approved || false,
        date_created: user.created_at.toISOString(),
        last_login: user.settings?.last_login || null,
        avatar: user.settings?.avatar,
        otp: user.settings?.otp || ''
    };
}

export async function getUserCount(): Promise<number> {
    const count = await UserModel.countDocuments();
    return count;
}

export async function createUser(user: SourceryAccount) {
    const hashedPassword = await hashPassword(user.password);
    await UserModel.create({
        email: user.username,
        name: user.username,  // Using username as name for now
        password_hash: hashedPassword,
        settings: {
            admin: user.admin,
            approved: user.approved,
            avatar: user.avatar,
            otp: user.otp
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
    const user = await UserModel.findOne({ email: username });
    if (!user) {
        return false;
    }
    if (await checkPassword(password, user.password_hash)) {
        return user._id.toString();
    }
    return false;
}

export async function updateUser(_id: string, user: SourceryAccount) {
    const data = {
        email: user.username,
        admin: user.admin,
        approved: user.approved
    }
    return await UserModel.findByIdAndUpdate(_id, data);
}