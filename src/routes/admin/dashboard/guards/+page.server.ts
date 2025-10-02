
import { db } from '$lib/server/db';
import { guard, admin } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;
  if (!user) throw redirect(303, '/login');

  // Get admin's residence
  const admins = await db.select().from(admin).where(eq(admin.id, user.id));
  if (!admins.length) throw redirect(303, '/login');

  const adminData = admins[0];
  const residenceId = adminData.residenceId;

  // Only get guards for this residence
  const guards = residenceId 
    ? await db.select().from(guard).where(eq(guard.residenceId, residenceId))
    : await db.select().from(guard);

  return { guards };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const name = form.get('name')?.toString().trim();
    const phone = form.get('phone')?.toString().trim();
    const guardId = form.get('guardId')?.toString().trim();
    if (!name || !phone || !guardId) {
      return fail(400, { error: 'All fields are required.' });
    }

    // Get admin's residence ID
    const user = locals.user;
    if (!user) return fail(401, { error: 'Unauthorized' });

    const admins = await db.select().from(admin).where(eq(admin.id, user.id));
    if (!admins.length) return fail(401, { error: 'Unauthorized' });

    const residenceId = admins[0].residenceId;

    // Use guardId as username for uniqueness
    try {
      // Default password: use guardId as temporary password (hashed)
      const defaultHash = encodeHexLowerCase(sha256(new TextEncoder().encode(guardId)));
      await db.insert(guard).values({
        username: guardId,
        name,
        phone,
        guardId,
        passwordHash: defaultHash,
        residenceId // Associate guard with residence
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
