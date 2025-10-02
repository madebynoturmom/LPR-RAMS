import { guestPass, guestPassHistory } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { v4 as uuidv4 } from 'uuid';
import { fail } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm/sql/expressions/conditions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const passes = await db.select().from(guestPass);
	return { passes };
};

export const actions: Actions = {
   create: async (event) => {
	   const { request, locals } = event;
	   const user = locals.user;
	   if (!user || (user.role !== 'guard' && user.role !== 'resident' && user.role !== 'admin')) {
		   return fail(403, { error: 'Only guards, residents, or admins can create guest passes.' });
	   }

	   console.log('User Role:', user.role); // Debugging log to verify user role
	   const form = await request.formData();
	   const plateNumber = form.get('plateNumber')?.toString().trim();
	   const name = form.get('name')?.toString().trim();
	   const phone = form.get('phone')?.toString().trim();
	const visitTime = form.get('visitTime')?.toString();
	   const durationMinutes = Number(form.get('durationMinutes'));

	   if (!plateNumber || !name || !phone || !visitTime || !durationMinutes) {
		   return fail(400, { error: 'All fields are required.' });
	   }

	   const id = uuidv4();
	   await db.insert(guestPass).values({
		   id,
		   plateNumber,
		   visitTime: Math.floor(new Date(visitTime).getTime() / 1000),
		   durationMinutes,
		   status: 'active',
		   userId: user.id,
		   type: 'visitors',
		   name,
		   phone
	   });

	   // Schedule expiration logic
		 setTimeout(async () => {
				 try {
					 // Mark the guest_pass as expired
					 await db.update(guestPass).set({ status: 'expired' }).where(eq(guestPass.id, id));

					 // Read the expired row
					 const expiredRows = await db.select().from(guestPass).where(eq(guestPass.id, id)).limit(1);
					 const expired = expiredRows[0];
					 if (expired) {
						 // Insert into history using primitives (revoked_at as epoch seconds)
									 await db.insert(guestPassHistory).values({
										 id: expired.id,
										 plateNumber: expired.plateNumber,
										 visitTime: expired.visitTime,
										 durationMinutes: expired.durationMinutes,
										 status: 'expired',
										 userId: expired.userId,
										 type: expired.type,
										 revokedAt: Math.floor(Date.now() / 1000),
										 name: expired.name,
										 phone: expired.phone
									 });

						 // Delete from active table
						 await db.delete(guestPass).where(eq(guestPass.id, id));
					 }
					 console.log('Guest pass expired:', id);
				 } catch (err) {
					 console.error('Error during scheduled expiration for pass', id, err);
				 }
		 }, durationMinutes * 60 * 1000);

	   return { success: true };
   },
	delete: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();
		if (!id) return fail(400, { error: 'Missing pass ID.' });
		await db.delete(guestPass).where(eq(guestPass.id, id));
		throw redirect(303, '/admin/dashboard/guests?deleted=1');
	}
};
