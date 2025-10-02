import { db } from '$lib/server/db';
import { vehicle, user } from '$lib/server/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
  const allUsers = await db.select().from(user);
  const users = allUsers.filter((u: any) => u.role === 'resident');
  return { users };
// removed stray brace
};

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const plateNumber = form.get('plateNumber')?.toString().trim();
    const ownerId = form.get('ownerId')?.toString();
    const model = form.get('model')?.toString();
    const makeYear = Number(form.get('makeYear'));
    if (!plateNumber || !ownerId || !model || !makeYear) {
      return fail(400, { error: 'All fields are required.' });
    }

    // Check if plate number already exists
    const existingVehicles = await db.select().from(vehicle).where(eq(vehicle.plateNumber, plateNumber)).limit(1);
    const existingVehicle = existingVehicles[0];
    if (existingVehicle) {
      return fail(400, { error: 'A vehicle with this plate number already exists.' });
    }

    try {
      await db.insert(vehicle).values({
        id: uuidv4(),
        plateNumber,
        ownerId,
        model,
        makeYear
      });
    } catch (e) {
      return fail(500, { error: 'Failed to add vehicle.' });
    }
    throw redirect(303, '/admin/dashboard/vehicles');
  }
};
