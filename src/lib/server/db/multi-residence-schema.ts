import { pgTable, text, integer, boolean, jsonb, unique } from 'drizzle-orm/pg-core';

// ===== RESIDENCE MANAGEMENT TABLES =====

export const residence = pgTable('residence', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  phone: text('phone'),
  email: text('email'),
  timezone: text('timezone').default('UTC'),
  settings: jsonb('settings').default('{}'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  status: text('status', { enum: ['active', 'inactive', 'suspended'] }).default('active')
});

export const residenceAdmin = pgTable('residence_admin', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  email: text('email'),
  phone: text('phone'),
  profilePic: text('profile_pic'),
  isSuperAdmin: boolean('is_super_admin').default(false),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
});

export const residenceAdminAccess = pgTable('residence_admin_access', {
  id: text('id').primaryKey(),
  adminId: text('admin_id').notNull().references(() => residenceAdmin.id, { onDelete: 'cascade' }),
  residenceId: text('residence_id').notNull().references(() => residence.id, { onDelete: 'cascade' }),
  permissions: jsonb('permissions').default('{}'),
  createdAt: integer('created_at').notNull()
}, (table) => ({
  uniqueAdminResidence: unique().on(table.adminId, table.residenceId)
}));

export const residenceSettings = pgTable('residence_settings', {
  id: text('id').primaryKey(),
  residenceId: text('residence_id').notNull().references(() => residence.id, { onDelete: 'cascade' }),
  settingKey: text('setting_key').notNull(),
  settingValue: jsonb('setting_value'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
}, (table) => ({
  uniqueResidenceSetting: unique().on(table.residenceId, table.settingKey)
}));

// ===== UPDATED EXISTING TABLES =====

export const admin = pgTable('admin', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  email: text('email'),
  phone: text('phone'),
  profilePic: text('profile_pic'),
  residenceId: text('residence_id').references(() => residence.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at')
});

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  age: integer('age'),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['guard', 'resident'] }).notNull(),
  name: text('name'),
  email: text('email'),
  phone: text('phone'),
  carNumber: text('car_number'),
  houseAddress: text('house_address'),
  profilePic: text('profile_pic'),
  residenceId: text('residence_id').references(() => residence.id, { onDelete: 'cascade' }),
  unitNumber: text('unit_number'),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at')
});

export const guard = pgTable('guard', {
  id: integer('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  phone: text('phone'),
  guardId: text('guard_id').notNull().unique(),
  profilePic: text('profile_pic'),
  residenceId: text('residence_id').references(() => residence.id, { onDelete: 'cascade' }),
  shiftStartTime: text('shift_start_time'),
  shiftEndTime: text('shift_end_time'),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at')
});

export const vehicle = pgTable('vehicle', {
  id: text('id').primaryKey(),
  plateNumber: text('plate_number').notNull().unique(),
  ownerId: text('owner_id').notNull(),
  model: text('model').notNull(),
  makeYear: integer('make_year').notNull(),
  accessTime: integer('access_time'),
  residenceId: text('residence_id').references(() => residence.id, { onDelete: 'cascade' }),
  vehicleType: text('vehicle_type').default('car'),
  color: text('color'),
  isActive: boolean('is_active').default(true),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at')
});

export const guestPass = pgTable('guest_pass', {
  id: text('id').primaryKey(),
  plateNumber: text('plate_number').notNull(),
  visitTime: integer('visit_time').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  status: text('status', { enum: ['active', 'expired', 'revoked'] }).notNull(),
  userId: text('user_id').notNull(),
  type: text('type', { enum: ['visitors', 'food_delivery'] }).notNull().default('visitors'),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  residenceId: text('residence_id').references(() => residence.id, { onDelete: 'cascade' }),
  approvedBy: text('approved_by'),
  entryGate: text('entry_gate'),
  notes: text('notes'),
  createdAt: integer('created_at')
});

export const guestPassHistory = pgTable('guest_pass_history', {
  id: text('id').primaryKey(),
  plateNumber: text('plate_number').notNull(),
  visitTime: integer('visit_time').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  status: text('status', { enum: ['active', 'expired', 'revoked'] }).notNull(),
  userId: text('user_id').notNull(),
  type: text('type', { enum: ['visitors', 'food_delivery'] }).notNull(),
  revokedAt: integer('revoked_at').notNull(),
  name: text('name'),
  phone: text('phone'),
  residenceId: text('residence_id').references(() => residence.id, { onDelete: 'cascade' }),
  approvedBy: text('approved_by'),
  entryGate: text('entry_gate'),
  exitGate: text('exit_gate'),
  notes: text('notes'),
  createdAt: integer('created_at')
});

export const eventLog = pgTable('event_log', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  userId: text('user_id'),
  details: text('details'),
  timestamp: integer('timestamp').notNull(),
  residenceId: text('residence_id').references(() => residence.id, { onDelete: 'cascade' }),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent')
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  expiresAt: integer('expires_at').notNull(),
  residenceId: text('residence_id').references(() => residence.id, { onDelete: 'cascade' })
});

export const otp = pgTable('otp', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  code: text('code').notNull(),
  expiresAt: integer('expires_at').notNull()
});

// ===== TYPE EXPORTS =====

export type Residence = typeof residence.$inferSelect;
export type ResidenceAdmin = typeof residenceAdmin.$inferSelect;
export type ResidenceAdminAccess = typeof residenceAdminAccess.$inferSelect;
export type ResidenceSettings = typeof residenceSettings.$inferSelect;
export type Admin = typeof admin.$inferSelect;
export type User = typeof user.$inferSelect;
export type Guard = typeof guard.$inferSelect;
export type Vehicle = typeof vehicle.$inferSelect;
export type GuestPass = typeof guestPass.$inferSelect;
export type GuestPassHistory = typeof guestPassHistory.$inferSelect;
export type EventLog = typeof eventLog.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Otp = typeof otp.$inferSelect;