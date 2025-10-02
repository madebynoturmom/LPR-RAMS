import { pgTable, text, integer, boolean } from 'drizzle-orm/pg-core';

export const vehicle = pgTable('vehicle', {
  id: text('id').primaryKey(),
  plateNumber: text('plate_number').notNull().unique(),
  ownerId: text('owner_id').notNull(), // FK to user.id
  model: text('model').notNull(),
  makeYear: integer('make_year').notNull(),
  accessTime: integer('access_time'),
  residenceId: text('residence_id'), // FK to residence.id
  vehicleType: text('vehicle_type').default('car'),
  color: text('color'),
  isActive: boolean('is_active').default(true),
  createdAt: integer('created_at'),
  updatedAt: integer('updated_at')
});

export type Vehicle = typeof vehicle.$inferSelect;
