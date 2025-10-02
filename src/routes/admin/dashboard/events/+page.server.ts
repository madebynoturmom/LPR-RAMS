import { db } from '$lib/server/db';
import { eventLog, user } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const eventsRaw = await db.select().from(eventLog);
  const users = await db.select().from(user);
  const userMap = Object.fromEntries(users.map((u: any) => [u.id, u]));
  const events = eventsRaw.map((e: any) => {
    const ts = typeof e.timestamp === 'string' ? parseInt(e.timestamp, 10) : e.timestamp;
    return {
      ...e,
      userName: e.userId ? (userMap[e.userId]?.name || userMap[e.userId]?.username || '-') : 'System',
      time: new Date(Number(ts) * 1000).toLocaleString()
    };
  });
  return { events };
};
