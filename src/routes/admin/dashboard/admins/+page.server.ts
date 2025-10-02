import { db } from '$lib/server/db';
import { admin as adminTable, session as sessionTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';

export const load = async () => {
  const admins = await db.select().from(adminTable);
  return { admins };
};

export const actions = {
  deleteAdmin: async (event: import('@sveltejs/kit').RequestEvent) => {
    const form = await event.request.formData();
    const id = form.get('id');
    if (typeof id !== 'string') return fail(400, { error: 'Invalid admin ID' });
    // Delete all sessions for the admin first
    await db.delete(sessionTable).where(eq(sessionTable.userId, id));
    await db.delete(adminTable).where(eq(adminTable.id, id));
    throw redirect(303, '/admin/dashboard/admins?deleted=1');
  },

  updateAdmin: async (event: import('@sveltejs/kit').RequestEvent) => {
    const form = await event.request.formData();
    const id = form.get('id');
    const username = form.get('username');
    if (typeof id !== 'string' || typeof username !== 'string') return fail(400, { error: 'Invalid input' });
    await db.update(adminTable).set({ username }).where(eq(adminTable.id, id));
    return { success: true };
  },

  createAdmin: async (event: import('@sveltejs/kit').RequestEvent) => {
    const form = await event.request.formData();
    const username = form.get('username');
    const passwordHash = form.get('passwordHash');
    if (typeof username !== 'string' || typeof passwordHash !== 'string') return fail(400, { error: 'Invalid input' });
    // Optionally add more fields (name, email, etc.)
    await db.insert(adminTable).values({
      id: crypto.randomUUID(),
      username,
      passwordHash
    });
    return { success: true };
  }
};
