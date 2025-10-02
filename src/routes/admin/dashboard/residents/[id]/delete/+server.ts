import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { json, type RequestEvent } from '@sveltejs/kit';

export async function POST({ params }: RequestEvent) {
  const id = params.id;
  if (!id) {
    return json({ success: false, error: 'Missing resident id' }, { status: 400 });
  }
  await db.delete(user).where(eq(user.id, id));
  return json({ success: true });
}
