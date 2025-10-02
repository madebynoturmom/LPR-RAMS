import type { RequestEvent } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { sendEmail } from './email';


export const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export type ServerSession = {
	id: string;
	userId: string;
	expiresAt: Date;
	residenceId?: string;
};

export async function createSession(token: string, userId: string, residenceId?: string, ttlMs: number = DAY_IN_MS * 30): Promise<ServerSession> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const expiresAtNumber = Math.floor((Date.now() + ttlMs) / 1000); // store epoch seconds
	const expiresAtDate = new Date(expiresAtNumber * 1000);
	// Ensure we pass only primitives to the DB adapter (driver expects primitives for bound values)
	const dbSession = {
		id: String(sessionId),
		userId: String(userId),
		expiresAt: Number(expiresAtNumber),
		residenceId: residenceId ? String(residenceId) : null
	};
	try {
		await db.insert(table.session).values(dbSession);
	} catch (err) {
		console.error('Failed to insert session into DB. Bound values and types:', dbSession, {
			idType: typeof dbSession.id,
			userIdType: typeof dbSession.userId,
			expiresAtType: typeof dbSession.expiresAt,
			residenceIdType: typeof dbSession.residenceId
		});
		throw err;
	}
	// return a session object with expiresAt as Date for callers
	return { ...dbSession, expiresAt: expiresAtDate, residenceId: residenceId } as unknown as ServerSession;
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	
	// Try residence_admin table first (super admins and residence admins)
	const residenceAdminResult = await db
		.select({
			admin: table.residenceAdmin,
			session: table.session,
			residence: table.residence
		})
		.from(table.session)
		.innerJoin(table.residenceAdmin, eq(table.session.userId, table.residenceAdmin.id))
		.leftJoin(table.residence, eq(table.residenceAdmin.residenceId, table.residence.id))
		.where(eq(table.session.id, sessionId));
		
	if (residenceAdminResult.length > 0) {
		const { session, admin, residence } = residenceAdminResult[0];
		const user = { 
			id: admin.id, 
			username: admin.username, 
			role: admin.isSuperAdmin ? 'super_admin' as const : 'residence_admin' as const,
			residenceId: admin.residenceId,
			residenceName: residence?.name
		};
		// normalize expiresAt (DB returns epoch seconds)
		const expiresAtDate = typeof session.expiresAt === 'number' ? new Date(session.expiresAt * 1000) : new Date(session.expiresAt as any);
		const sessionExpired = Date.now() >= expiresAtDate.getTime();
		if (sessionExpired) {
			await db.delete(table.session).where(eq(table.session.id, session.id));
			return { session: null, user: null };
		}
		const renewSession = Date.now() >= expiresAtDate.getTime() - DAY_IN_MS * 15;
		let returnedSession = session;
		if (renewSession) {
			const newExpiresNumber = Math.floor((Date.now() + DAY_IN_MS * 30) / 1000);
			// update DB with epoch seconds
			await db.update(table.session).set({ expiresAt: newExpiresNumber }).where(eq(table.session.id, session.id));
			// prepare returned session with Date expiresAt for callers
			returnedSession = { ...session };
		}
		// return a copy where callers can access expiresAt as a Date via `expiresAtDate`
		return { session: { ...returnedSession, expiresAt: expiresAtDate, residenceId: admin.residenceId } as ServerSession, user };
	}
	
	// Try admin table (local admins)
	const adminResult = await db
		.select({
			admin: table.admin,
			session: table.session,
			residence: table.residence
		})
		.from(table.session)
		.innerJoin(table.admin, eq(table.session.userId, table.admin.id))
		.leftJoin(table.residence, eq(table.admin.residenceId, table.residence.id))
		.where(eq(table.session.id, sessionId));
		
	if (adminResult.length > 0) {
		const { session, admin, residence } = adminResult[0];
		const user = { 
			id: admin.id, 
			username: admin.username, 
			role: 'admin' as const,
			residenceId: admin.residenceId,
			residenceName: residence?.name
		};
		// normalize expiresAt (DB returns epoch seconds)
		const expiresAtDate = typeof session.expiresAt === 'number' ? new Date(session.expiresAt * 1000) : new Date(session.expiresAt as any);
		const sessionExpired = Date.now() >= expiresAtDate.getTime();
		if (sessionExpired) {
			await db.delete(table.session).where(eq(table.session.id, session.id));
			return { session: null, user: null };
		}
		const renewSession = Date.now() >= expiresAtDate.getTime() - DAY_IN_MS * 15;
		let returnedSession = session;
		if (renewSession) {
			const newExpiresNumber = Math.floor((Date.now() + DAY_IN_MS * 30) / 1000);
			// update DB with epoch seconds
			await db.update(table.session).set({ expiresAt: newExpiresNumber }).where(eq(table.session.id, session.id));
			// prepare returned session with Date expiresAt for callers
			returnedSession = { ...session };
		}
		// return a copy where callers can access expiresAt as a Date via `expiresAtDate`
		return { session: { ...returnedSession, expiresAt: expiresAtDate, residenceId: admin.residenceId } as ServerSession, user };
	}
	// Try user table (resident/guard)
	const userResult = await db
		.select({
			user: { 
				id: table.user.id, 
				username: table.user.username, 
				role: table.user.role,
				residenceId: table.user.residenceId
			},
			session: table.session,
			residence: table.residence
		})
		.from(table.session)
		.innerJoin(table.user, eq(table.session.userId, table.user.id))
		.leftJoin(table.residence, eq(table.user.residenceId, table.residence.id))
		.where(eq(table.session.id, sessionId));
	if (userResult.length === 0) {
		return { session: null, user: null };
	}
	const { session, user, residence } = userResult[0];
	const userWithResidence = {
		...user,
		residenceName: residence?.name
	};
		// normalize expiresAt (DB returns epoch seconds)
		const expiresAtDate = typeof session.expiresAt === 'number' ? new Date(session.expiresAt * 1000) : new Date(session.expiresAt as any);
		const sessionExpired = Date.now() >= expiresAtDate.getTime();
		if (sessionExpired) {
			await db.delete(table.session).where(eq(table.session.id, session.id));
			return { session: null, user: null };
		}
		const renewSession = Date.now() >= expiresAtDate.getTime() - DAY_IN_MS * 15;
		let returnedSession = session;
		if (renewSession) {
			const newExpiresNumber = Math.floor((Date.now() + DAY_IN_MS * 30) / 1000);
			await db.update(table.session).set({ expiresAt: newExpiresNumber }).where(eq(table.session.id, session.id));
			returnedSession = { ...session };
		}
	return { session: { ...returnedSession, expiresAt: expiresAtDate, residenceId: user.residenceId } as ServerSession, user: userWithResidence };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await db.delete(table.session).where(eq(table.session.id, sessionId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	// Determine whether the request is same-origin. If not, browsers require
	// SameSite=None and Secure to allow cookies in cross-site requests. We set
	// Secure only when the current request is over HTTPS. In dev over HTTP,
	// Secure will be false which prevents cross-site cookies from being set.
	const originHeader = event.request.headers.get('origin');
	let sameSite: 'lax' | 'none' = 'lax';
	let secure = false;
	try {
		if (originHeader) {
			const originUrl = new URL(originHeader);
			const sameOrigin = originUrl.origin === event.url.origin;
			if (!sameOrigin) {
				sameSite = 'none';
				secure = event.url.protocol === 'https:';
			}
		} else {
			// No Origin header implies same-origin navigation in most cases
			secure = event.url.protocol === 'https:';
		}
	} catch (e) {
		// If parsing fails, fall back to conservative defaults
		secure = event.url.protocol === 'https:';
	}

	// Honor common proxy headers for TLS termination (e.g., when running
	// behind an nginx/ELB that terminates TLS). If x-forwarded-proto or
	// x-forwarded-ssl indicate https, treat the original request as secure.
	try {
		const fwd = event.request.headers.get('x-forwarded-proto') || event.request.headers.get('x-forwarded-ssl');
		if (fwd && !secure) {
			const proto = fwd.split(',')[0].trim().toLowerCase();
			if (proto === 'https' || proto === 'on') secure = true;
		}
	} catch (e) {
		// ignore
	}

	const cookieOptions = {
		expires: expiresAt,
		path: '/',
		httpOnly: true,
		sameSite,
		secure
	} as const;

	console.log(`🔐 setSessionTokenCookie: setting cookie (sameSite=${sameSite}, secure=${secure})`);

	event.cookies.set(sessionCookieName, token, cookieOptions);
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}

