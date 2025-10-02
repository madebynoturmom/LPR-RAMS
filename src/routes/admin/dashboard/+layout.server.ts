import { db } from '$lib/server/db';
import { admin } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const user = locals.user;
  if (!user) throw redirect(303, '/login');

  const admins = await db.select().from(admin).where(eq(admin.id, user.id));
  if (!admins.length) throw redirect(303, '/login');

  const adminData = admins[0];
  return { user: adminData };
};