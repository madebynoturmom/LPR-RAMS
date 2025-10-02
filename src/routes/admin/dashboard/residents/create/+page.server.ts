
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eventLog } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions } from './$types';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { sendEmail } from '$lib/server/email';

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const name = form.get('name')?.toString().trim();
    const email = form.get('email')?.toString().trim();
    const phone = form.get('phone')?.toString().trim();
    const carNumber = form.get('carNumber')?.toString().trim();
    const houseAddress = form.get('houseAddress')?.toString().trim();

    if (!name || !email || !phone || !carNumber || !houseAddress) {
      return fail(400, { error: 'All fields are required.' });
    }

    // Generate a unique username and id for the resident
    // Find max user### username
    const residents = await db.select().from(user).where(eq(user.role, 'resident'));
    const userNumbers = residents
      .map((r: any) => typeof r.username === 'string' && r.username.startsWith('user') ? parseInt(r.username.slice(4), 10) : 0)
      .filter((n: number) => n > 0);
    const maxUserNum = userNumbers.length > 0 ? Math.max(...userNumbers) : 0;
    const nextUserNum = maxUserNum + 1;
    const username = `user${nextUserNum}`;
    const plainPassword = username; // Password reflects the username
    
    // Find max R### id
    const maxNum = residents
      .map((r: any) => typeof r.id === 'string' && r.id.startsWith('R') ? parseInt(r.id.slice(1), 10) : 0)
      .reduce((max: number, n: number) => n > max ? n : max, 0);
    const nextNum = maxNum + 1;
    const id = `R${nextNum.toString().padStart(3, '0')}`;
    // Hash the password (using SHA256, same as login expects)
    const passwordHash = encodeHexLowerCase(sha256(new TextEncoder().encode(plainPassword)));

    try {
      await db.insert(user).values({
        id,
        username,
        passwordHash,
        role: 'resident',
        name,
        email,
        phone,
        carNumber,
        houseAddress
      });
      // Send the plainPassword to the resident's email address
      // await sendEmail(email, 'Your Resident Account', `Welcome! Your password is: ${plainPassword}`);

      // Log the event into event_log
      try {
        const evId = `E${Date.now()}`;
        await db.insert(eventLog).values({
          id: evId,
          type: 'resident_created',
          userId: username,
          details: `Created resident ${name} (${id})`,
          timestamp: Math.floor(Date.now() / 1000)
        });
      } catch (logErr) {
        // Non-fatal: continue even if logging fails
        console.error('Failed to write event log', logErr);
      }

      // Redirect back to the residents list
      throw redirect(303, '/admin/dashboard/residents?created=1');
    } catch (e) {
      return fail(500, { error: 'Failed to create resident.' });
    }
  }
};
