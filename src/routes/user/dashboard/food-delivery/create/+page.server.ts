import { db } from '$lib/server/db';
import { guestPass as guestPassTable, user } from '$lib/server/db/schema';
import { vehicle } from '$lib/server/db/vehicle';
import { v4 as uuidv4 } from 'uuid';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { eq, and } from 'drizzle-orm';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const userSession = locals.user;
    if (!userSession) return fail(401, { error: 'Not authenticated.' });

    // Fetch full user data
    const fullUser = await db.select().from(user).where(eq(user.id, userSession.id)).get();
    if (!fullUser) return fail(401, { error: 'User not found.' });

    const form = await request.formData();
    const plateNumber = form.get('plateNumber')?.toString().trim();
    const name = form.get('name')?.toString().trim();
    const phone = form.get('phone')?.toString().trim();
    const durationMinutes = Number(form.get('durationMinutes'));

    if (!plateNumber || !name || !phone || !durationMinutes) {
      return fail(400, { error: 'All fields are required.' });
    }

    // Check if the plate number already exists in the user's vehicles
    const existingVehicle = await db
      .select()
      .from(vehicle)
      .where(and(eq(vehicle.plateNumber, plateNumber), eq(vehicle.ownerId, userSession.id)))
      .limit(1);

    if (existingVehicle.length > 0) {
      return fail(400, { error: 'This plate number belongs to one of your registered vehicles. Please enter a different plate number for the food delivery pass.' });
    }

    const id = uuidv4();
    try {
      await db.insert(guestPassTable).values({
        id,
        plateNumber,
        visitTime: Math.floor(Date.now() / 1000),
        durationMinutes,
        status: 'active',
        userId: userSession.id,
        type: 'food_delivery',
        name,
        phone
      });
    } catch (e) {
      return fail(500, { error: 'Failed to issue pass.' });
    }

    throw redirect(303, '/user/dashboard/food-delivery');
  }
};