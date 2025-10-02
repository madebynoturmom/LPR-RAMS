import { db } from '$lib/server/db';
import { guestPass as guestPassTable, user, guestPassHistory, type GuestPass } from '$lib/server/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { eq, and, sql, desc } from 'drizzle-orm';

export const actions: Actions = {
  revoke: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return fail(401, { error: 'Not authenticated.' });
    const form = await request.formData();
    const id = form.get('id')?.toString();
    if (!id) return fail(400, { error: 'Missing food delivery pass id' });
    // Find the food delivery pass
    const pass = await db.select().from(guestPassTable).where(eq(guestPassTable.id, id)).get();
    if (!pass || pass.userId !== user.id) return fail(403, { error: 'Food delivery pass not found or not owned by you' });
    // Move to history
    await db.insert(guestPassHistory).values({
      id: pass.id,
      plateNumber: pass.plateNumber,
      visitTime: pass.visitTime,
      durationMinutes: pass.durationMinutes,
      status: pass.status,
      userId: user.id, // User who revoked
      type: pass.type,
      revokedAt: Math.floor(Date.now() / 1000),
      name: pass.name,
      phone: pass.phone
    });
    // Delete from active
    await db.delete(guestPassTable).where(eq(guestPassTable.id, id));
    // Redirect to refresh
    throw redirect(303, '/user/dashboard/food-delivery');
  },
  extend: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return fail(401, { error: 'Not authenticated.' });
    const form = await request.formData();
    const id = form.get('id')?.toString();
    const additionalMinutes = Number(form.get('duration'));
    if (!id || !additionalMinutes || isNaN(additionalMinutes)) return fail(400, { error: 'Missing or invalid data' });
    // Check ownership
    const pass = await db.select().from(guestPassTable).where(eq(guestPassTable.id, id)).get();
    if (!pass || pass.userId !== user.id) return fail(403, { error: 'Food delivery pass not found or not owned by you' });
    // Add the additional time to the existing duration
    const newDuration = pass.durationMinutes + additionalMinutes;
    await db.update(guestPassTable)
      .set({ durationMinutes: newDuration })
      .where(eq(guestPassTable.id, id));
    throw redirect(303, '/user/dashboard/food-delivery');
  }
};

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;
  if (!user) return { foodDeliveryPasses: [] };

  // Get all active food delivery passes, then filter for non-expired ones
  const allFoodDeliveryPasses = (await db.select().from(guestPassTable).where(
    and(
      eq(guestPassTable.userId, user.id),
      eq(guestPassTable.type, 'food_delivery'),
      eq(guestPassTable.status, 'active')
    )
  ).orderBy(desc(guestPassTable.visitTime))) as GuestPass[];
  
  // Filter for active passes (not expired)
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const toVisitSeconds = (v: any) => {
    if (v == null) return 0;
    if (typeof v === 'number') return Math.floor(v);
    if (v instanceof Date) return Math.floor(v.getTime() / 1000);
    const n = Number(v);
    if (!Number.isNaN(n)) return Math.floor(n);
    return 0;
  };

  const foodDeliveryPasses = allFoodDeliveryPasses.filter((pass: GuestPass) => {
    const visitTimeSeconds = toVisitSeconds(pass.visitTime);
    const expirationTime = visitTimeSeconds + (pass.durationMinutes * 60);
    return now < expirationTime;
  });
  
  return { foodDeliveryPasses };
};
