import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { admin } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const load = async ({ locals }: any) => {
  const user = locals.user;
  if (!user) throw redirect(302, '/login');
  if (user.role !== 'admin') throw redirect(302, '/');
  const [adminRow] = await db.select().from(admin).where(eq(admin.id, user.id));
  return { user: adminRow };
};

export const actions = {
  default: async ({ request, locals }: any) => {
    const user = locals.user;
    if (!user) throw redirect(302, '/login');
    if (user.role !== 'admin') throw redirect(302, '/');

    const form = await request.formData();
    const name = form.get('name') as string;
    const email = form.get('email') as string;
    const username = form.get('username') as string;
    const password = form.get('password') as string;

    let profilePic = undefined;
    const file = form.get('profilePicture') as File | null;
    if (file && (file as any).size > 0) {
      const uploadDir = path.resolve('static/uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const fileName = `admin_${user.id}_${Date.now()}_${(file as any).name}`;
      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(await (file as any).arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      profilePic = `/uploads/${fileName}`;
    }

    const updateData: Record<string, any> = { name, email, username };
    if (profilePic) updateData.profilePic = profilePic;
    if (password && password.length > 0) {
      updateData.passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    }

    await db.update(admin)
      .set(updateData)
      .where(eq(admin.id, user.id));

    return { success: true };
  }
};