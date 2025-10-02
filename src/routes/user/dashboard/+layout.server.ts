import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const user = locals.user;
  if (!user) throw redirect(303, '/login');

  const users = await db.select().from(userTable).where(eq(userTable.id, user.id));
  if (!users.length) throw redirect(303, '/login');

  const userData = users[0];
  console.log('Layout load - user data:', userData);
  console.log('Layout load - profile pic:', userData.profilePic);
  
  return { user: userData };
};