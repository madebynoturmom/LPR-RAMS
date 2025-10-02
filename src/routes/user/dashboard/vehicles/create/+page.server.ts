import { db } from '$lib/server/db';
import { vehicle as vehicleTable } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { v4 as uuidv4 } from 'uuid';
import type { Actions } from './$types';
import { eq } from 'drizzle-orm';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return fail(401, { error: 'Not authenticated.' });
    const form = await request.formData();
    const model = form.get('model')?.toString();
    const makeYear = Number(form.get('makeYear'));
    const plateNumber = form.get('plateNumber')?.toString();
    if (!model || !makeYear || !plateNumber) {
      return fail(400, { error: 'All fields are required.' });
    }

    // Check if plate number already exists
    const existingVehicle = await db.select().from(vehicleTable).where(eq(vehicleTable.plateNumber, plateNumber)).get();
    if (existingVehicle) {
      return fail(400, { error: 'A vehicle with this plate number already exists.' });
    }

    try {
      await db.insert(vehicleTable).values({
        id: uuidv4(),
        model,
        makeYear,
        plateNumber,
        ownerId: user.id
      });
    } catch (e) {
      return fail(500, { error: 'Failed to add vehicle.' });
    }
    throw redirect(303, '/user/dashboard/vehicles');
  }
};
