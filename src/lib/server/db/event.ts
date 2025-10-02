import { pgTable, text, integer } from 'drizzle-orm/pg-core';

export const eventLog = pgTable('event_log', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // e.g. 'login', 'vehicle_entry', etc.
  userId: text('user_id'), // optional, can be null for system events
  details: text('details'),
  timestamp: integer('timestamp').notNull(),
  residenceId: text('residence_id'), // FK to residence.id
  ipAddress: text('ip_address'),
  userAgent: text('user_agent')
});

export type EventLog = typeof eventLog.$inferSelect;
