import { db } from '$lib/server/db';
import { vehicle as vehicleTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) throw redirect(303, '/login');
  const { id } = params;
  const vehicles = await db.select().from(vehicleTable).where(eq(vehicleTable.id, id));
  if (!vehicles.length) throw redirect(303, '/user/dashboard/vehicles');
  const vehicle = vehicles[0];
  if (vehicle.ownerId !== user.id) throw redirect(303, '/user/dashboard/vehicles');
  return { vehicle };
};

export const actions: Actions = {
  default: async ({ params, locals }) => {
    console.log('Delete action triggered'); // Debugging log

    const user = locals.user;
    console.log('User from locals:', user); // Debugging log

    if (!user) {
      console.error('Authentication failed: No user'); // Debugging log
      return fail(401, { error: 'Not authenticated.' });
    }

    const { id } = params;
    console.log('Vehicle ID to delete:', id); // Debugging log

    try {
      await db.delete(vehicleTable).where(eq(vehicleTable.id, id));
      console.log('Vehicle deleted successfully:', id); // Debugging log

      return { success: true };
    } catch (e) {
      console.error('Error deleting vehicle:', e); // Debugging log
      return fail(500, { error: 'Failed to delete vehicle.' });
    }
  }
};
