import crypto from "crypto";
import bcrypt from "bcryptjs";
import { randomBytes } from 'crypto';

export function md5(input: string): string {
    return crypto.createHash('md5').update(input).digest('hex');
}

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

export async function checkPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function generateSecureToken(length: number = 32): Promise<string> {
    const bytes = randomBytes(Math.ceil(length / 2));
    return bytes.toString('hex').slice(0, length);
}