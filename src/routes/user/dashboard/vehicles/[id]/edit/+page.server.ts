import { db } from '$lib/server/db';
import { vehicle as vehicleTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

function getUserIdFromSession(cookies: any): string | null {
  return 'R001'; // Replace with real session logic
}

export const load: PageServerLoad = async ({ params, cookies }) => {
  const userId = getUserIdFromSession(cookies);
  if (!userId) throw redirect(303, '/login');
  const { id } = params;
  const vehicles = await db.select().from(vehicleTable).where(eq(vehicleTable.id, id));
  if (!vehicles.length) throw redirect(303, '/user/dashboard/vehicles');
  const vehicle = vehicles[0];
  if (vehicle.ownerId !== userId) throw redirect(303, '/user/dashboard/vehicles');
  return { vehicle };
};

export const actions: Actions = {
  default: async ({ request, params, cookies }) => {
    const userId = getUserIdFromSession(cookies);
    if (!userId) return fail(401, { error: 'Not authenticated.' });
    const { id } = params;
    const form = await request.formData();
    const model = form.get('model')?.toString();
    const makeYear = Number(form.get('makeYear'));
    const plateNumber = form.get('plateNumber')?.toString();
    if (!model || !makeYear || !plateNumber) {
      return fail(400, { error: 'All fields are required.' });
    }
    try {
      await db.update(vehicleTable)
        .set({ model, makeYear, plateNumber })
        .where(eq(vehicleTable.id, id));
      return { success: true };
    } catch (e) {
      return fail(500, { error: 'Failed to update vehicle.' });
    }
  }
};
