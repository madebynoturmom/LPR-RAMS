import nodemailer from 'nodemailer';

// Build transporter from env vars with sensible fallbacks.
// Prefer explicit SMTP_HOST/SMTP_PORT/SMTP_SECURE when provided, otherwise allow SMTP_SERVICE (e.g. 'gmail') and SMTP_USER/SMTP_PASS.
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const smtpSecure = typeof process.env.SMTP_SECURE !== 'undefined' ? process.env.SMTP_SECURE === 'true' : undefined;
const smtpService = process.env.SMTP_SERVICE; // e.g. 'gmail'
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || smtpUser;

const transportOpts: any = {};
if (smtpHost) {
  transportOpts.host = smtpHost;
  if (smtpPort) transportOpts.port = smtpPort;
  if (typeof smtpSecure !== 'undefined') transportOpts.secure = smtpSecure;
  transportOpts.auth = smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined;
} else if (smtpService) {
  transportOpts.service = smtpService;
  transportOpts.auth = smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined;
} else {
  // default to Gmail service if nothing else provided (keeps previous behavior)
  transportOpts.service = 'gmail';
  transportOpts.auth = smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined;
}

// Allow insecure TLS in local/dev if explicitly requested
transportOpts.tls = { rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false' };

const transporter = nodemailer.createTransport(transportOpts);

// Log initialization summary
console.log('� Initializing SMTP transporter with options:', {
  host: smtpHost || null,
  port: smtpPort || null,
  secure: typeof smtpSecure !== 'undefined' ? smtpSecure : null,
  service: smtpService || (smtpHost ? null : 'gmail'),
  userConfigured: !!smtpUser,
  from: smtpFrom ? `${smtpFrom.substring(0, 3)}***` : null
});

export async function sendEmail(to: string, subject: string, text: string) {
  console.log('📤 ===== EMAIL SEND ATTEMPT =====');
  console.log('📧 To:', to);
  console.log('📄 Subject:', subject);
  console.log('📝 Content length:', text?.length ?? 0, 'characters');

  const mailOptions: any = {
    from: smtpFrom,
    to,
    subject,
    text
  };

  console.log('📋 Mail options prepared:', {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    hasText: !!mailOptions.text
  });

  // Helpful hint when credentials are missing
  if (!smtpUser || !smtpPass) {
    console.warn('⚠️ SMTP credentials not fully configured (SMTP_USER/SMTP_PASS). Sending may fail.');
  }

  try {
    console.log('🔌 Testing SMTP connection (verify)...');
    const connectionTest = await transporter.verify();
    console.log('✅ SMTP connection test result:', connectionTest ? 'OK' : 'FAILED');

    if (!connectionTest) {
      throw new Error('SMTP connection verification failed');
    }

    const result = await transporter.sendMail(mailOptions);

    console.log('✅ ===== EMAIL SENT SUCCESSFULLY =====');
    console.log('📨 Message ID:', result.messageId);
    console.log('🔄 Response:', result.response);
    console.log('📮 Accepted recipients:', result.accepted);
    console.log('❌ Rejected recipients:', result.rejected);

    return result;
  } catch (error: any) {
    console.error('❌ ===== EMAIL SEND FAILED =====');
    console.error('🔴 Error message:', error?.message ?? error);
    console.error('🔴 Error code:', error?.code ?? null);
    console.error('🔴 Error response:', error?.response ?? null);

    // Offer guidance for authentication issues
    if (error?.code === 'EAUTH') {
      console.error('🔐 AUTH ERROR: Authentication failed. Check SMTP_USER/SMTP_PASS and provider settings.');
      console.error('💡 If using Google, use an App Password and enable 2FA.');
    }

    // Attach the transport options snapshot for easier debugging (do not log full password)
    console.error('� Transport snapshot:', {
      host: smtpHost || null,
      port: smtpPort || null,
      secure: typeof smtpSecure !== 'undefined' ? smtpSecure : null,
      service: smtpService || null,
      userConfigured: !!smtpUser
    });

    throw error;
  }
}
