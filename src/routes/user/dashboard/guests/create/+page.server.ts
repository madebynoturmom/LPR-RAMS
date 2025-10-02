import { db } from '$lib/server/db';
import { guestPass as guestPassTable } from '$lib/server/db/schema';
import { vehicle } from '$lib/server/db/vehicle';
import { v4 as uuidv4 } from 'uuid';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { eq, and } from 'drizzle-orm';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    console.log('Received request to create guest pass'); // Debugging log

    const user = locals.user;
    console.log('User from locals:', user); // Debugging log

    if (!user || !user.role) {
      console.error('Authentication failed:', user); // Debugging log
      return fail(401, { error: 'Not authenticated.' });
    }

    const { id: userId, role: userRole } = user;
    console.log('User ID:', userId, 'Role:', userRole); // Debugging log

    if (!userRole || (userRole !== 'guard' && userRole !== 'resident' && userRole !== 'admin')) {
      console.error('Role validation failed:', userRole); // Debugging log
      return fail(403, { error: 'Only guards, residents, or admins can create guest passes.' });
    }

    const form = await request.formData();
    const plateNumber = form.get('plateNumber')?.toString().trim();
    const name = form.get('name')?.toString().trim();
    const phone = form.get('phone')?.toString().trim();
    const visitTime = form.get('visitTime')?.toString();
    const durationMinutes = Number(form.get('durationMinutes'));

    console.log('Form Data:', { plateNumber, name, phone, visitTime, durationMinutes }); // Debugging log

    if (!plateNumber || !name || !phone || !visitTime || !durationMinutes) {
      console.error('Validation failed for form data:', { plateNumber, name, phone, visitTime, durationMinutes }); // Debugging log
      return fail(400, { error: 'All fields are required.' });
    }

    // Check if the plate number already exists in the user's vehicles
    const existingVehicle = await db
      .select()
      .from(vehicle)
      .where(and(eq(vehicle.plateNumber, plateNumber), eq(vehicle.ownerId, userId)))
      .limit(1);

    if (existingVehicle.length > 0) {
      console.error('Plate number already exists in user vehicles:', plateNumber); // Debugging log
      return fail(400, { error: 'This plate number belongs to one of your registered vehicles. Please enter a different plate number for the guest pass.' });
    }

    const id = uuidv4();
    try {
      await db.insert(guestPassTable).values({
        id,
        plateNumber,
        visitTime: Math.floor(new Date(visitTime).getTime() / 1000),
        durationMinutes,
        status: 'active',
        userId, // Associate the guest pass with the logged-in user
        type: 'visitors',
        name,
        phone
      });

      console.log('Guest pass created:', id); // Debugging log

      // Schedule expiration logic
      setTimeout(async () => {
        await db.update(guestPassTable)
          .set({ status: 'expired' })
          .where(eq(guestPassTable.id, id));
        console.log('Guest pass expired:', id); // Debugging log
      }, durationMinutes * 60 * 1000);

    } catch (e) {
      console.error('Error creating guest pass:', e); // Debugging log
      return fail(500, { error: 'Failed to create guest pass.' });
    }

    throw redirect(303, '/user/dashboard/guests');
  }
};
