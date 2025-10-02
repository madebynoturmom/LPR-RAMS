import { db } from '$lib/server/db';
import { guard, admin } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const name = form.get('name')?.toString().trim();
    const phone = form.get('phone')?.toString().trim();

    // Get admin's residence ID
    const user = locals.user;
    if (!user) return fail(401, { error: 'Unauthorized' });

    const admins = await db.select().from(admin).where(eq(admin.id, user.id));
    if (!admins.length) return fail(401, { error: 'Unauthorized' });

    const residenceId = admins[0].residenceId;

    // Generate next G### id (only for this residence)
    const guards = residenceId 
      ? await db.select().from(guard).where(eq(guard.residenceId, residenceId))
      : await db.select().from(guard);
      
    const maxNum = guards
      .map((g: any) => typeof g.guardId === 'string' && g.guardId.startsWith('G') ? parseInt(g.guardId.slice(1), 10) : 0)
      .reduce((max: number, n: number) => n > max ? n : max, 0);
    const nextNum = maxNum + 1;
    const guardId = `G${nextNum.toString().padStart(3, '0')}`;
    
    const file = form.get('profilePic');
    let profilePic: string | null = null;
    if (file && typeof file === 'object' && 'arrayBuffer' in file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      profilePic = `data:${file.type};base64,${buffer.toString('base64')}`;
    }
    
    if (!name || !phone || !guardId) {
      return fail(400, { error: 'All fields are required.' });
    }
    
    try {
      // Default password: use guardId as initial password (admin should communicate/change it)
      const plainPassword = guardId;
      const passwordHash = encodeHexLowerCase(sha256(new TextEncoder().encode(plainPassword)));
      await db.insert(guard).values({
        username: guardId,
        passwordHash,
        name,
        phone,
        guardId,
        profilePic,
        residenceId // Associate guard with residence
      });
      console.log(`Created guard ${guardId} with default password: ${plainPassword} for residence: ${residenceId}`);
      throw redirect(303, '/admin/dashboard/guards');
    } catch (e) {
      return fail(500, { error: 'Failed to create guard.' });
    }
  }
};
