import { UserModel } from '@sourcery/common/src/models/User.model';
import type { User } from '@sourcery/common/types/User.type';
import { SourceryPub } from '@sourcery/queue/src/pub.js';
const pub = new SourceryPub(`sourcery.info-ws`);

async function pubUser(user: User): Promise<void> {
    if (!user._id) {
        return;
    }
    const user_db = await getUser(user._id);
    pub.addJob(`${user_db._id}:user`, { user: user_db });
}

function mapDBUser(user: User): User {
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
    }
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

export async function createUser(user: Omit<User, '_id'> & { _id?: string }): Promise<User> {
    if (user._id) {
        delete user._id;
    }
    const newUser = await UserModel.create(user);
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