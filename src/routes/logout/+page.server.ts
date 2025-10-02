import { redirect, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { session as sessionTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';

export const actions = {
  default: async (event: RequestEvent) => {
    const sessionToken = event.cookies.get('auth-session');
    if (sessionToken) {
      await db.delete(sessionTable).where(eq(sessionTable.id, sessionToken));
      event.cookies.delete('auth-session', { path: '/' });
    }
  throw redirect(303, '/login');
  }
};
