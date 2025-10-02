import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const id = params.id;
  const resident = await db.select().from(user).where(eq(user.id, id)).then((rows: any[]) => rows[0]);
  return { resident };
};
