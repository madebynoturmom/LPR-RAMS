import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const id = params.id;
  const resident = await db.select().from(user).where(eq(user.id, id)).then((rows: any[]) => rows[0]);
  return { resident };
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const form = await request.formData();
    const name = form.get('name')?.toString().trim();
    const email = form.get('email')?.toString().trim();
    const phone = form.get('phone')?.toString().trim();
    const carNumber = form.get('carNumber')?.toString().trim();
    const houseAddress = form.get('houseAddress')?.toString().trim();
    if (!name || !email || !phone || !carNumber || !houseAddress) {
      return fail(400, { error: 'All fields are required.' });
    }
    try {
      await db.update(user)
        .set({ name, email, phone, carNumber, houseAddress })
        .where(eq(user.id, params.id));
      throw redirect(303, '/admin/dashboard/residents');
    } catch (e) {
      return fail(500, { error: 'Failed to update resident.' });
    }
  }
};
