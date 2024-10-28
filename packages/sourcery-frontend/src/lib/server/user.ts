import { Settings } from "$lib/classes/settings";
import type { SourceryAccount } from "$lib/types/SourcerySettings.type";
import { md5, hashPassword, checkPassword } from "$lib/utils/crypto";
export async function getUsers(): Promise<SourceryAccount[]> {
    const settings = new Settings();
	const accounts = settings.get('accounts') as SourceryAccount[];
	if (!accounts || accounts.length === 0) {
		return [];
	}
	return accounts;
}

export async function createUser(user: SourceryAccount) {
    const settings = new Settings();
    const accounts = settings.get('accounts') as SourceryAccount[] || [];
    const hashedPassword = await hashPassword(user.password);
    // Create a user_id as md5 hash of the current time and the username
    const user_id = md5(new Date().toISOString() + user.username);
    accounts.push({
        user_id,
        username: user.username,
        password: hashedPassword,
		otp: user.otp ?? '',
        admin: user.admin,
        approved: user.approved,
        date_created: new Date().toISOString(),
        last_login: null,
        avatar: user.avatar,
    });
    // console.log(accounts);
    await settings.set({ accounts });
}

export async function checkUniqueUsername(username: string) {
    const settings = new Settings();
    const accounts = settings.get('accounts') as SourceryAccount[];
    if (!accounts || accounts.length === 0) {
        return false;
    }
    return accounts.some(account => account.username === username);
}

export async function checkUserCredentials(username: string, password: string) {
    const settings = new Settings();
    const accounts = settings.get('accounts') as SourceryAccount[];
    if (!accounts || accounts.length === 0) {
        return false;
    }
    const account = accounts.find(account => account.username === username);
    if (!account) {
        return false;
    }
    return await checkPassword(password, account.password);
}