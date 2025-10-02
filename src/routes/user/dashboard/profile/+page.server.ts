import { db } from '$lib/server/db';
import { user as userTable } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import fs from 'fs';
import path from 'path';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;
  if (!user) throw redirect(303, '/login');
  const users = await db.select().from(userTable).where(eq(userTable.id, user.id));
  if (!users.length) throw redirect(303, '/login');
  const userData = users[0];
  return { user: userData };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) return fail(401, { error: 'Not authenticated.' });
    const form = await request.formData();
    const name = form.get('name')?.toString();
    const email = form.get('email')?.toString();
    const username = form.get('username')?.toString();
    const password = form.get('password')?.toString();
    const phone = form.get('phone')?.toString();
    const houseAddress = form.get('houseAddress')?.toString();
    let profilePic = undefined;
    const file = form.get('profilePicture') as File | null;
    if (file && file.size > 0) {
      const uploadDir = path.resolve('static/uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const fileName = `user_${user.id}_${Date.now()}_${file.name}`;
      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      profilePic = `/uploads/${fileName}`;
    }
    const updateData: Record<string, any> = { name, email, username, phone, houseAddress };
    if (profilePic) updateData.profilePic = profilePic;
    if (password && password.length > 0) {
      updateData.passwordHash = encodeHexLowerCase(sha256(new TextEncoder().encode(password)));
    }
    await db.update(userTable)
      .set(updateData)
      .where(eq(userTable.id, user.id));
    return { success: true };
  }
};
