import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eventLog } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  const recentEvents = await db.select().from(eventLog).orderBy(desc(eventLog.timestamp)).limit(10);

  const activeGuestPasses = recentEvents.filter((event: any) => event.type === 'guest_pass' && event.details?.includes('active')).length;
  const activeFoodDeliveryPasses = recentEvents.filter((event: any) => event.type === 'food_delivery' && event.details?.includes('active')).length;
  const recentCarAccess = recentEvents.find((event: any) => event.type === 'vehicle_access')?.details || 'N/A';

  return json({
    activeGuestPasses,
    activeFoodDeliveryPasses,
    recentCarAccess
  });
}