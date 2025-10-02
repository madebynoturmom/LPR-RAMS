import { db } from '$lib/server/db';
import { admin, guard, user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export const GET = async ({ url }) => {
  const username = url.searchParams.get('username')?.toString().trim();
  if (!username) return json({ role: null }, { status: 400 });
  const usernameLower = username.toLowerCase();

  // Check admin
  const admins = await db.select().from(admin).where(eq(admin.username, usernameLower));
  if (admins.length > 0) return json({ role: 'admin' });

  // Check guard
  const guards = await db.select().from(guard).where(eq(guard.username, usernameLower));
  if (guards.length > 0) return json({ role: 'guard' });

  // Check user (resident)
  const users = await db.select().from(user).where(eq(user.username, usernameLower));
  if (users.length > 0) return json({ role: users[0].role });

  return json({ role: null }, { status: 404 });
};
