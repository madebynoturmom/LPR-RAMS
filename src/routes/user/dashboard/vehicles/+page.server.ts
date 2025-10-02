import { db } from '$lib/server/db';
import { vehicle as vehicleTable } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';

// Dummy session logic: replace with real session extraction
function getUserIdFromSession(cookies: any): string | null {
  // In production, decode the session cookie and fetch userId
  return 'R001'; // For demo
}

export const load: PageServerLoad = async ({ cookies }) => {
  const userId = getUserIdFromSession(cookies);
  if (!userId) return { vehicles: [] };

  const vehicles = await db.select().from(vehicleTable).where(eq(vehicleTable.ownerId, userId));
  return { vehicles };
};
