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

import type { RequestEvent, Cookies } from "@sveltejs/kit";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import Redis from "ioredis";

const redis = new Redis({
	host: process.env.REDIS_HOST,
	port: parseInt(process.env.REDIS_PORT ?? "6379")
});

const sessionDuration = 60 * 60 * 24 * 30; // 30 days
const sessionPrefix = "session:";

export interface Session {
	id: string;
	user_id: string;
	expiresAt: Date;
}

async function saveSession(session: Session): Promise<void> {
	await redis.set(
		`${sessionPrefix}${session.id}`,
		JSON.stringify({
			id: session.id,
			user_id: session.user_id,
			expires_at: Math.floor(session.expiresAt.getTime())
		}),
		"EX",
		Math.floor(sessionDuration)
	);
}

export async function createSession(token: string, user_id: string): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		user_id,
		expiresAt: new Date(Date.now() + sessionDuration * 1000)
	};
	await saveSession(session);
	return session;
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await redis.del(`${sessionPrefix}${sessionId}`);
}

export async function validateSessionToken(token: string): Promise<Session | null> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const item = await redis.get(`${sessionPrefix}${sessionId}`);
	if (item === null) {
		return null;
	}
	const result = JSON.parse(item);
	const session: Session = {
		id: result.id,
		user_id: result.user_id,
		expiresAt: new Date(result.expires_at * 1000)
	};
	if (Date.now() >= session.expiresAt.getTime()) {
		await redis.del(`${sessionPrefix}${sessionId}`);
		return null;
	}
	if (Date.now() >= session.expiresAt.getTime() - 1000 * sessionDuration / 2) {
		session.expiresAt = new Date(Date.now() + sessionDuration * 1000);
		await saveSession(session);
	}
	return session;
}

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export function setSessionTokenCookie(cookies: Cookies, token: string, expiresAt: Date): void {
	cookies.set("session", token, {
		httpOnly: true,
		sameSite: "lax",
		expires: expiresAt,
		path: "/"
	});
}

export function deleteSessionTokenCookie(cookies: Cookies): void {
	cookies.set("session", "", {
		httpOnly: true,
		sameSite: "lax",
		maxAge: 0,
		path: "/"
	});
}
