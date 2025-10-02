import { db } from '$lib/server/db';
import { guestPass as guestPassTable, type GuestPass } from '$lib/server/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return {
      recentActivity: {
        activeGuestPasses: 0,
        activeFoodDeliveryPasses: 0,
        recentCarAccess: 'N/A'
      },
      activeGuestPasses: [],
      activeFoodDeliveryPasses: []
    };
  }

  // Get active guest passes count
  const activeGuestPassesCountResult = await db.select({ count: sql<number>`count(*)` }).from(guestPassTable).where(
    and(
      eq(guestPassTable.userId, user.id),
      eq(guestPassTable.status, 'active'),
      eq(guestPassTable.type, 'visitors')
    )
  );
  const activeGuestPassesCount = activeGuestPassesCountResult[0]?.count || 0;

  // Get the actual active guest passes - use Drizzle select for proper type conversion
  const allActiveGuestPasses = (await db.select().from(guestPassTable).where(
    and(
      eq(guestPassTable.userId, user.id),
      eq(guestPassTable.status, 'active'),
      eq(guestPassTable.type, 'visitors')
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

  const activeGuestPasses = allActiveGuestPasses.filter((pass: GuestPass) => {
    const visitTimeSeconds = toVisitSeconds(pass.visitTime);
    const expirationTime = visitTimeSeconds + (pass.durationMinutes * 60);
    return now < expirationTime;
  });

  // Get active food delivery passes count
  const activeFoodDeliveryPassesCountResult = await db.select({ count: sql<number>`count(*)` }).from(guestPassTable).where(
    and(
      eq(guestPassTable.userId, user.id),
      eq(guestPassTable.status, 'active'),
      eq(guestPassTable.type, 'food_delivery')
    )
  );
  const activeFoodDeliveryPassesCount = activeFoodDeliveryPassesCountResult[0]?.count || 0;

  // Get the actual active food delivery passes - use Drizzle select for proper type conversion
  const allActiveFoodDeliveryPasses = (await db.select().from(guestPassTable).where(
    and(
      eq(guestPassTable.userId, user.id),
      eq(guestPassTable.status, 'active'),
      eq(guestPassTable.type, 'food_delivery')
    )
  ).orderBy(desc(guestPassTable.visitTime))) as GuestPass[];
  
  // Filter for active passes (not expired)
  const activeFoodDeliveryPasses = allActiveFoodDeliveryPasses.filter((pass: GuestPass) => {
    const visitTimeSeconds = toVisitSeconds(pass.visitTime);
    const expirationTime = visitTimeSeconds + (pass.durationMinutes * 60);
    return now < expirationTime;
  });

  // For recent car access, we could check vehicle access events, but for now keep as N/A
  const recentCarAccess = 'N/A';

  return {
    recentActivity: {
      activeGuestPasses: activeGuestPassesCount,
      activeFoodDeliveryPasses: activeFoodDeliveryPassesCount,
      recentCarAccess
    },
    activeGuestPasses,
    activeFoodDeliveryPasses
  };
};