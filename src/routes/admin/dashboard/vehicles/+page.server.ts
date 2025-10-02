
import { db } from '$lib/server/db';
import { vehicle, user } from '$lib/server/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm/sql/expressions/conditions';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Join vehicles with user to get owner name and house address
  const vehiclesRaw = await db.select().from(vehicle);
  const users = await db.select().from(user);
  const userMap = Object.fromEntries(users.map((u: any) => [u.id, u]));
  const vehicles = vehiclesRaw.map((v: any) => ({
    ...v,
    ownerName: userMap[v.ownerId]?.name || userMap[v.ownerId]?.username || '-',
    houseAddress: userMap[v.ownerId]?.houseAddress || 'No address'
  }));
  return { vehicles, users };
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const form = await request.formData();
    const id = form.get('id')?.toString();
    if (!id) return fail(400, { error: 'Missing vehicle ID.' });
    await db.delete(vehicle).where(eq(vehicle.id, id));
    throw redirect(303, '/admin/dashboard/vehicles?deleted=1');
  }
};
