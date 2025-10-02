import { db } from '$lib/server/db';
import { guestPass as guestPassTable, guestPassHistory, eventLog, type GuestPass } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

function requireGuard(locals: any) {
  if (!locals.user) return { ok: false, status: 401, message: 'Not authenticated.' };
  if (locals.user.role !== 'guard') return { ok: false, status: 403, message: 'Forbidden: guard role required.' };
  return { ok: true, user: locals.user };
}

export const load: PageServerLoad = async ({ locals }) => {
  const check = requireGuard(locals);
  if (!check.ok) return { activeVisitorPasses: [], activeFoodDeliveryPasses: [], recentCarAccess: [] };

  // Get active visitor and food delivery passes, filter expired in JS
  const now = Math.floor(Date.now() / 1000);

  const allVisitors = (await db.select().from(guestPassTable).where(eq(guestPassTable.type, 'visitors'))) as GuestPass[];
  const toVisitSeconds = (v: any) => {
    if (v == null) return 0;
    if (typeof v === 'number') return Math.floor(v);
    if (v instanceof Date) return Math.floor(v.getTime() / 1000);
    const n = Number(v);
    if (!Number.isNaN(n)) return Math.floor(n);
    return 0;
  };
  const activeVisitorPasses = allVisitors.filter((pass: GuestPass) => {
    const visitTimeSeconds = toVisitSeconds(pass.visitTime);
    const expirationTime = visitTimeSeconds + pass.durationMinutes * 60;
    return pass.status === 'active' && now < expirationTime;
  }).map((p: GuestPass) => ({ ...p, visitTime: new Date(toVisitSeconds(p.visitTime) * 1000).toISOString() }));

  const allFood = (await db.select().from(guestPassTable).where(eq(guestPassTable.type, 'food_delivery'))) as GuestPass[];
  const activeFoodDeliveryPasses = allFood.filter((pass: GuestPass) => {
    const visitTimeSeconds = toVisitSeconds(pass.visitTime);
    const expirationTime = visitTimeSeconds + pass.durationMinutes * 60;
    return pass.status === 'active' && now < expirationTime;
  }).map((p: GuestPass) => ({ ...p, visitTime: new Date(toVisitSeconds(p.visitTime) * 1000).toISOString() }));

  // recent vehicle events (last 10)
  const recentRows = await db.select().from(eventLog).orderBy('timestamp', 'desc').limit(10);
  const recentCarAccess = Array.isArray(recentRows) ? recentRows : [];

  return { activeVisitorPasses, activeFoodDeliveryPasses, recentCarAccess };
};

export const actions: Actions = {
  admit: async ({ request, locals }) => {
  const check = requireGuard(locals);
  if (!check.ok) return fail(check.status ?? 403, { error: check.message });

    const form = await request.formData();
    const id = form.get('id')?.toString();
    if (!id) return fail(400, { error: 'Missing pass id' });

      const pass = await db.select().from(guestPassTable).where(eq(guestPassTable.id, id)).get();
    if (!pass) return fail(404, { error: 'Pass not found' });

    // prevent admitting expired or non-active passes
    const now = Math.floor(Date.now() / 1000);
    const visitTimeSeconds = Math.floor(new Date(pass.visitTime).getTime() / 1000);
    const expirationTime = visitTimeSeconds + pass.durationMinutes * 60;
    if (pass.status !== 'active' || now >= expirationTime) return fail(400, { error: 'Pass is not active or has expired' });

    try {
      // Admission does not change the pass.status enum (keep 'active').
      // Record the admission in event_log for auditing.
      const guardUser = check.user;
  await db.insert(eventLog).values({ id: `E${Date.now()}`, type: 'vehicle_entry', userId: guardUser.id, details: `Admitted pass ${pass.id} (${pass.plateNumber}) by guard ${guardUser.username}`, timestamp: Math.floor(Date.now() / 1000) });
      return { success: true };
    } catch (e) {
      return fail(500, { error: 'Failed to admit pass.' });
    }
  },
  deny: async ({ request, locals }) => {
  const check = requireGuard(locals);
  if (!check.ok) return fail(check.status ?? 403, { error: check.message });

    const form = await request.formData();
    const id = form.get('id')?.toString();
    if (!id) return fail(400, { error: 'Missing pass id' });

  const pass = await db.select().from(guestPassTable).where(eq(guestPassTable.id, id)).get();
    if (!pass) return fail(404, { error: 'Pass not found' });

    // If already not active, just return
    if (pass.status !== 'active') return fail(400, { error: 'Pass is not active' });

    try {
      // move to history and delete active row
  await db.insert(guestPassHistory).values({ id: pass.id, plateNumber: pass.plateNumber, visitTime: Math.floor(new Date(pass.visitTime).getTime() / 1000), durationMinutes: pass.durationMinutes, status: 'revoked', userId: pass.userId, type: pass.type, revokedAt: Math.floor(Date.now() / 1000), name: pass.name, phone: pass.phone });
      await db.delete(guestPassTable).where(eq(guestPassTable.id, id));
      const guardUser = check.user;
  await db.insert(eventLog).values({ id: `E${Date.now()}`, type: 'access_denied', userId: guardUser.id, details: `Denied pass ${pass.id} (${pass.plateNumber}) by guard ${guardUser.username}`, timestamp: Math.floor(Date.now() / 1000) });
      return { success: true };
    } catch (e) {
      return fail(500, { error: 'Failed to deny pass.' });
    }
  }
};
