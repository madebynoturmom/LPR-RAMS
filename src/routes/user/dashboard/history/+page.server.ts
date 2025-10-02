import { db } from '$lib/server/db';
import { guestPassHistory, guestPass as guestPassTable, type GuestPass } from '$lib/server/db/schema';
import { eq, sql, and, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;
  if (!user) return { pastPasses: [] };

  // Get revoked passes from history table
  const revokedPasses = await db.select().from(guestPassHistory).where(eq(guestPassHistory.userId, user.id));

  // Get expired passes (active but past their expiration time)
  const allActivePasses = (await db.select().from(guestPassTable).where(
    and(
      eq(guestPassTable.userId, user.id),
      eq(guestPassTable.status, 'active')
    )
  )) as GuestPass[];
  
  const now = Math.floor(Date.now() / 1000);
  const toVisitSeconds = (v: any) => {
    if (v == null) return 0;
    if (typeof v === 'number') return Math.floor(v);
    if (v instanceof Date) return Math.floor(v.getTime() / 1000);
    const n = Number(v);
    if (!Number.isNaN(n)) return Math.floor(n);
    return 0;
  };

  const expiredPasses = allActivePasses.filter((pass: GuestPass) => {
    const visitTimeSeconds = toVisitSeconds(pass.visitTime);
    const expirationTime = visitTimeSeconds + (pass.durationMinutes * 60);
    return now >= expirationTime;
  }).map((pass: GuestPass) => ({ ...pass, reason: 'expired' as const }));

  // Combine and sort by most recent first
  const pastPasses = [
    ...revokedPasses.map((pass: any) => ({ ...pass, reason: 'revoked' as const })),
    ...expiredPasses
  ].sort((a: any, b: any) => new Date(b.visitTime).getTime() - new Date(a.visitTime).getTime());

  return { pastPasses };
};