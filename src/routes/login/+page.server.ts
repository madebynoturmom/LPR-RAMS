import { db } from '$lib/server/db';
import { user, admin, guard, session as sessionTable, otp } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { v4 as uuidv4 } from 'uuid';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import type { Actions, PageServerLoad } from './$types';
import { eq, desc } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { sendEmail } from '$lib/server/email';

export const actions: Actions = {
  default: async (event) => {
    console.log('🔐 Login Action: Starting');
    const { request } = event;
    const form = await request.formData();
  const username = form.get('username')?.toString().trim();
    const otpCode = form.get('otp')?.toString().trim();

    console.log('🔐 Received form data: username=', username, 'otpCode=', otpCode ? 'provided' : 'not provided');

    if (!username) {
      return fail(400, { error: 'Username is required.' });
    }

    const usernameLower = username.toLowerCase();

    let found: any = null;
    let userRole: string | null = null;
    let userEmail: string | null = null;
    const admins = await db.select().from(admin).where(eq(admin.username, usernameLower));
    if (admins.length > 0) {
      found = admins[0];
      userRole = 'admin';
      userEmail = found.email;
    } else {
      // Try guard table next
      const guards = await db.select().from(guard).where(eq(guard.username, usernameLower));
      if (guards.length > 0) {
        found = guards[0];
        userRole = 'guard';
        userEmail = null; // guards don't have email in schema
      } else {
        const users = await db.select().from(user).where(eq(user.username, usernameLower));
        if (users.length > 0) {
          found = users[0];
          userRole = found.role;
          userEmail = found.email;
        }
      }
    }
    if (!found) {
      console.log('🔐 User not found for username:', username);
      return fail(401, { error: 'Invalid username.' });
    }

    // Only require email for OTP flows (admin and resident). Guards authenticate with password.
    if (userRole !== 'guard' && !userEmail) {
      console.log('🔐 No email associated with user:', username);
      return fail(400, { error: 'No email associated with this user.' });
    }

  console.log('🔐 User found:', usernameLower, 'Role:', userRole, 'Email:', userEmail);

    // Guard authentication: use password instead of OTP
    if (userRole === 'guard') {
      const password = form.get('password')?.toString();
      if (!password) {
        return fail(400, { error: 'Password is required for guard login.' });
      }
      // Verify password (sha256 hex lowercase)
      const providedHash = encodeHexLowerCase(sha256(new TextEncoder().encode(password)));
      if (!found.passwordHash || providedHash !== found.passwordHash) {
        console.log('🔐 Guard password mismatch for user:', username);
        return fail(401, { error: 'Invalid password.' });
      }

      // Create session for guard
        const rememberFlag = form.get('remember')?.toString() === '1';
        const ttlMs = rememberFlag ? auth.DAY_IN_MS * 30 : 1000 * 60 * 60 * 8; // 30 days vs 8 hours
        const sessionToken = auth.generateSessionToken();
        const session = await auth.createSession(sessionToken, found.id, ttlMs);
        auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
      const redirectUrl = '/guard/dashboard';
      const accept = request.headers.get('accept') || '';
      if (accept.includes('application/json')) return { success: true, redirect: redirectUrl };
      throw redirect(303, redirectUrl);
    }

    // For admins and residents: OTP flow (unchanged)
    if (!otpCode) {
      const targetEmail = userEmail;
      if (!targetEmail) {
        console.log('🔐 No email available for OTP flow (unexpected)');
        return fail(500, { error: 'No email for OTP flow.' });
      }
      console.log('🔐 OTP Generation: Starting for username:', username);
      // Generate OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('🔐 OTP Generated:', code, 'for email:', targetEmail);
      const expiresAt = Math.floor((Date.now() + 5 * 60 * 1000) / 1000); // 5 minutes (epoch seconds)
      console.log('🔐 OTP Expires At (epoch seconds):', expiresAt);
      await db.insert(otp).values({
        id: uuidv4(),
        email: targetEmail,
        code,
        expiresAt
      });
      console.log('🔐 OTP Stored in DB');
      // Send email
      console.log('📧 SMTP_USER configured:', !!process.env.SMTP_USER);
      console.log('📧 SMTP_PASS configured:', !!process.env.SMTP_PASS);
      console.log('📧 Preparing to send OTP email to:', targetEmail);

      // Ensure SMTP credentials are present before attempting to send
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('📧 SMTP credentials are missing. Check SMTP_USER and SMTP_PASS in .env');
        return fail(500, { error: 'Email service not configured. Please contact the administrator.' });
      }

      // Build a friendly email body with expiry info
      const expiresMinutes = 5;
      const emailSubject = 'Your RAMS OTP Code';
      const emailBody = `Hello ${found.username || username},\n\nYour one-time login code is: ${code}\nThis code will expire in ${expiresMinutes} minutes.\n\nIf you didn't request this, please ignore this message.\n\n— RAMS`;

      try {
        await sendEmail(targetEmail, emailSubject, emailBody);
        console.log('📧 OTP Email sent successfully to', targetEmail);
      } catch (emailError) {
        console.error('📧 OTP Email send failed:', emailError);
        return fail(500, { error: 'Failed to send OTP email. Please try again later.' });
      }
      const body = { otpSent: true, message: 'OTP sent to your email.' };
      console.log('🔐 Sending back response (action):', body);

      return body;
    } else {
      console.log('🔐 OTP Verification: Starting for email:', userEmail, 'OTP:', otpCode);
      // Verify OTP
      const targetEmail = userEmail;
      if (!targetEmail) {
        console.log('🔐 No email available for OTP verification (unexpected)');
        return fail(500, { error: 'No email for OTP verification.' });
      }
      const otpRecords = await db.select().from(otp).where(eq(otp.email, targetEmail)).orderBy(desc(otp.expiresAt));
      console.log('🔐 OTP Records found:', otpRecords.length);
      if (otpRecords.length === 0) {
        console.log('🔐 No OTP records found for email:', userEmail);
        return fail(401, { error: 'No OTP found. Please request a new one.' });
      }
      const latestOtp = otpRecords[0];
      console.log('🔐 Latest OTP:', latestOtp.code, 'Expires:', latestOtp.expiresAt);
      // Normalize expiresAt to milliseconds for comparison with Date.now()
      const otpExpiresAtMs = typeof latestOtp.expiresAt === 'number'
        ? Number(latestOtp.expiresAt) * 1000
        : new Date(latestOtp.expiresAt).getTime();
      if (Date.now() > otpExpiresAtMs) {
        console.log('🔐 OTP expired');
        return fail(401, { error: 'OTP expired. Please request a new one.' });
      }
      if (latestOtp.code !== otpCode) {
        console.log('🔐 OTP mismatch: provided', otpCode, 'stored', latestOtp.code);
        return fail(401, { error: 'Invalid OTP.' });
      }
      console.log('🔐 OTP verified successfully');
      // Delete used OTP
      await db.delete(otp).where(eq(otp.id, latestOtp.id));
      console.log('🔐 OTP deleted from DB');

  // Create session
  const rememberFlag = form.get('remember')?.toString() === '1';
  const ttlMs = rememberFlag ? auth.DAY_IN_MS * 30 : 1000 * 60 * 60 * 8; // 30 days vs 8 hours
  const sessionToken = auth.generateSessionToken();
  const session = await auth.createSession(sessionToken, found.id, ttlMs);
  auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
      // Determine redirect URL based on role
      const redirectUrl = userRole === 'admin'
        ? '/admin/dashboard'
        : userRole === 'guard'
        ? '/guard/dashboard'
        : userRole === 'resident'
        ? '/user/dashboard'
        : '/';
      return { success: true, redirect: redirectUrl };
    }
  }
};

// Lucia login logic will be implemented here

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user as { id: string; username: string; role: string } | null;
  if (user) {
    const redirectUrl = user.role === 'admin'
      ? '/admin/dashboard'
      : user.role === 'guard'
      ? '/guard/dashboard'
      : user.role === 'resident'
      ? '/user/dashboard'
      : '/';
    throw redirect(303, redirectUrl);
  }
  return {};
};
