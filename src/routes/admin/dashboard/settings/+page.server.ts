import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { admin } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '$lib/settingsSchema';
import type { AppSettings } from '$lib/settingsSchema';

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user;
  if (!user) throw redirect(302, '/login');
  if (user.role !== 'admin') throw redirect(302, '/');
  const [adminRow] = await db.select().from(admin).where(eq(admin.id, user.id));
  const appSettings = loadSettings();
  return { user: adminRow, settings: appSettings };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    // existing account update flow (unchanged)
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
  },

  save: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) throw redirect(302, '/login');
    if (user.role !== 'admin') throw redirect(302, '/');
    const form = await request.formData();
    // parse simple tabbed settings form values
    const general_siteTitle = form.get('general.siteTitle')?.toString() ?? DEFAULT_SETTINGS.general.siteTitle;
    const general_enableRegistration = form.get('general.enableRegistration') !== null;
    const general_defaultLocale = form.get('general.defaultLocale')?.toString() ?? DEFAULT_SETTINGS.general.defaultLocale;

    const appearance_theme = (form.get('appearance.theme')?.toString() as AppSettings['appearance']['theme']) || DEFAULT_SETTINGS.appearance.theme;
    const appearance_showAvatars = form.get('appearance.showAvatars') !== null;

    const integrations_sendgrid = form.get('integrations.sendgridApiKey')?.toString() || null;
    const integrations_slack = form.get('integrations.slackWebhook')?.toString() || null;

    const newSettings: AppSettings = {
      general: {
        siteTitle: general_siteTitle,
        enableRegistration: !!general_enableRegistration,
        defaultLocale: general_defaultLocale
      },
      integrations: {
        sendgridApiKey: integrations_sendgrid || null,
        slackWebhook: integrations_slack || null
      },
      appearance: {
        theme: appearance_theme || DEFAULT_SETTINGS.appearance.theme,
        showAvatars: !!appearance_showAvatars
      }
    };

    try {
      saveSettings(newSettings);
      return { success: true };
    } catch (err) {
      console.error('Failed to save settings', err);
      return fail(500, { error: 'Failed to save settings' });
    }
  }
};
