
import { db } from '$lib/server/db';
import { guard } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';

export const load: PageServerLoad = async () => {
  const guards = await db.select().from(guard);
  return { guards };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const name = form.get('name')?.toString().trim();
    const phone = form.get('phone')?.toString().trim();
    const guardId = form.get('guardId')?.toString().trim();
    if (!name || !phone || !guardId) {
      return fail(400, { error: 'All fields are required.' });
    }
    // Use guardId as username for uniqueness
    try {
      // Default password: use guardId as temporary password (hashed)
      const defaultHash = encodeHexLowerCase(sha256(new TextEncoder().encode(guardId)));
      await db.insert(guard).values({
        username: guardId,
        name,
        phone,
        guardId,
        passwordHash: defaultHash
      });
      throw redirect(303, '/admin/dashboard/guards');
    } catch (e) {
      return fail(500, { error: 'Failed to create guard.' });
    }
  }
  ,
  delete: async ({ request }) => {
    const form = await request.formData();
    const id = form.get('id')?.toString();
    if (!id) return fail(400, { error: 'Missing guard id' });
    try {
  await db.delete(guard).where(eq(guard.id, Number(id)));
  throw redirect(303, '/admin/dashboard/guards?deleted=1');
    } catch (e) {
      return fail(500, { error: 'Failed to delete guard.' });
    }
  }
};
