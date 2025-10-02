import { db } from '$lib/server/db';
import { user, admin, guard, guestPass, guestPassHistory, type GuestPass } from '$lib/server/db/schema';
import { vehicle } from '$lib/server/db/vehicle';
import { eventLog } from '$lib/server/db/event';
import { eq, and, gt, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Count residents as users with role 'resident'
  const [residents, guards, vehicles, users, admins, guests, events] = await Promise.all([
    db.select().from(user).where(eq(user.role, 'resident')),
    db.select().from(guard),
    db.select().from(vehicle),
    db.select().from(user),
    db.select().from(admin),
    db.select().from(guestPass),
    db.select().from(eventLog)
  ]);

  // Get guest stats for the last 7 days in a DB-agnostic way.
  const cutoff = Math.floor(Date.now() / 1000) - 6 * 24 * 60 * 60; // epoch seconds for 6 days ago

  const recentCurrent = await db.select({ visitTime: guestPass.visitTime }).from(guestPass).where(gt(guestPass.visitTime, cutoff));
  const recentHistory = await db.select({ visitTime: guestPassHistory.visitTime }).from(guestPassHistory).where(gt(guestPassHistory.visitTime, cutoff));

  const combined = [] as { visitTime: number | string | null }[];
  if (Array.isArray(recentCurrent)) combined.push(...recentCurrent as any);
  if (Array.isArray(recentHistory)) combined.push(...recentHistory as any);

  const countsByDate = new Map<string, number>();
  for (const row of combined) {
    const vt = row.visitTime;
    const secs = typeof vt === 'number' ? Math.floor(vt) : typeof vt === 'string' && vt ? Math.floor(Number(vt)) : 0;
    const date = new Date(secs * 1000).toISOString().slice(0, 10); // YYYY-MM-DD UTC
    countsByDate.set(date, (countsByDate.get(date) ?? 0) + 1);
  }

  const guestStats = Array.from(countsByDate.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Get active guest passes (visitors) - get all active, then filter in JS
  const allActiveGuestPasses = (await db.select().from(guestPass).where(
    and(
      eq(guestPass.status, 'active'),
      eq(guestPass.type, 'visitors')
    )
  )) as GuestPass[];
  
  const now = Math.floor(Date.now() / 1000);
  const toVisitSeconds = (v: any) => {
    if (v == null) return 0;
    if (typeof v === 'number') return Math.floor(v); // assume epoch seconds
    if (v instanceof Date) return Math.floor(v.getTime() / 1000);
    // fallback: try parseable string
    const n = Number(v);
    if (!Number.isNaN(n)) return Math.floor(n);
    return 0;
  };

  const activeGuestPasses = allActiveGuestPasses.filter((pass: GuestPass) => {
    const visitTimeSeconds = toVisitSeconds(pass.visitTime);
    const expirationTime = visitTimeSeconds + (pass.durationMinutes * 60);
    return now < expirationTime;
  }).length;

  // Get active food delivery passes - get all active, then filter in JS
  const allActiveFoodDeliveryPasses = (await db.select().from(guestPass).where(
    and(
      eq(guestPass.status, 'active'),
      eq(guestPass.type, 'food_delivery')
    )
  )) as GuestPass[];
  
  const activeFoodDeliveryPasses = allActiveFoodDeliveryPasses.filter((pass: GuestPass) => {
    const visitTimeSeconds = toVisitSeconds(pass.visitTime);
    const expirationTime = visitTimeSeconds + (pass.durationMinutes * 60);
    return now < expirationTime;
  }).length;

  // Get recent car access (latest vehicle entry event)
  const recentRows = await db.select({ details: eventLog.details, timestamp: eventLog.timestamp }).from(eventLog).where(eq(eventLog.type, 'vehicle_entry')).orderBy(desc(eventLog.timestamp)).limit(1);
  const recentRow = recentRows[0];
  const recentCarAccess = recentRow ? `${recentRow.details} at ${new Date((recentRow.timestamp ?? 0) * 1000).toLocaleString()}` : 'N/A';

  // Get admin user info from admin table
  let adminUsername = '';
  let adminProfilePic = '';
  if (locals.user && locals.user.id) {
    const [adminRow] = await db.select().from(admin).where(eq(admin.id, locals.user.id));
    if (adminRow) {
      adminUsername = adminRow.username;
      adminProfilePic = adminRow.profilePic || '';
    }
  }

  return {
    residents: residents.length,
    guards: guards.length,
    vehicles: vehicles.length,
    users: users.length,
    admins: admins.length,
    guests: guests.length,
    events: events.length,
    guestStats,
    activeGuestPasses,
    activeFoodDeliveryPasses,
    recentCarAccess,
    adminUsername,
    adminProfilePic
  };
};
