import { db, sql } from './server/db/index';

async function expireGuestPasses() {
  // Update guest passes that have expired (visit_time assumed to be epoch seconds)
  await sql`UPDATE guest_pass SET status = 'expired' WHERE visit_time + duration_minutes * 60 <= extract(epoch from now())::bigint AND status != 'revoked'`;

  // Move expired guest passes to guest_pass_history
  await sql`
    INSERT INTO guest_pass_history (id, plate_number, visit_time, duration_minutes, status, user_id, type, revoked_at, name, phone)
    SELECT id, plate_number, visit_time, duration_minutes, 'expired', user_id, type, extract(epoch from now())::bigint, name, phone
    FROM guest_pass
    WHERE status = 'expired'
  `;

  // Remove expired guest passes from guest_pass table
  await sql`DELETE FROM guest_pass WHERE status = 'expired'`;
}

// Run expiration logic every minute
setInterval(expireGuestPasses, 60000);