#!/usr/bin/env tsx
/**
 * Database Seeding Script
 * Populates the database with sample data for quick deployment
 * Run with: npm run seed or tsx scripts/seed-database.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { hash } from '@node-rs/argon2';
import * as schema from '../src/lib/server/db/schema';
import { residence, user, admin, vehicle, guard, guestPass } from '../src/lib/server/db/schema';
import { nanoid } from 'nanoid';

// Database connection
const connectionString = process.env.DATABASE_URL || 'postgresql://dev:2240@localhost:5432/lpr';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

// Helper function to convert Date to Unix timestamp (seconds)
const toUnixTimestamp = (date: Date): number => Math.floor(date.getTime() / 1000);

async function main() {
	console.log('🌱 Starting database seeding...\n');

	try {
		const now = new Date();
		const nowTimestamp = toUnixTimestamp(now);

		// 1. Create Residence
		console.log('📍 Creating residence...');
		const residenceData = {
			id: 'RES-001',
			name: 'Sunset Villa',
			address: '123 Palm Beach Drive, Miami, FL 33139',
			phone: '555-0999',
			email: 'info@sunsetvilla.com',
			createdAt: nowTimestamp,
			updatedAt: nowTimestamp,
			status: 'active' as const
		};

		const insertedResidence = await db.insert(residence).values(residenceData).returning();
		const residenceId = insertedResidence[0].id;
		console.log(`✅ Created residence: ${insertedResidence[0].name} (${residenceId})\n`);

		// 2. Create Admin User
		console.log('👤 Creating admin user...');
		const hashedAdminPassword = await hash('admin123', {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		const adminData = {
			id: nanoid(),
			username: 'admin',
			passwordHash: hashedAdminPassword,
			name: 'Admin User',
			email: 'pkartikean@gmail.com',
			phone: '555-0100',
			profilePic: null,
			residenceId: residenceId,
			createdAt: nowTimestamp,
			updatedAt: nowTimestamp
		};

		const insertedAdmin = await db.insert(admin).values(adminData).returning();
		console.log(`✅ Created admin: ${insertedAdmin[0].name} (username: admin, password: admin123)\n`);

		// 3. Create Resident Users
		console.log('🏠 Creating resident users...');
		const residentData = [
			{ username: 'john.doe', name: 'John Doe', email: 'pkartikean@gmail.com', phone: '555-0201', carNumber: 'ABC-1234', unitNumber: 'A101' },
			{ username: 'jane.smith', name: 'Jane Smith', email: 'pkartikean@gmail.com', phone: '555-0202', carNumber: 'XYZ-5678', unitNumber: 'A102' },
			{ username: 'bob.wilson', name: 'Bob Wilson', email: 'pkartikean@gmail.com', phone: '555-0203', carNumber: 'DEF-9012', unitNumber: 'B201' },
			{ username: 'alice.brown', name: 'Alice Brown', email: 'pkartikean@gmail.com', phone: '555-0204', carNumber: 'GHI-3456', unitNumber: 'B202' },
			{ username: 'charlie.davis', name: 'Charlie Davis', email: 'pkartikean@gmail.com', phone: '555-0205', carNumber: 'JKL-7890', unitNumber: 'C301' }
		];

		const hashedResidentPassword = await hash('resident123', {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		for (const resident of residentData) {
			// Create user account
			const userData = {
				id: nanoid(),
				username: resident.username,
				passwordHash: hashedResidentPassword,
				role: 'resident' as const,
				name: resident.name,
				email: resident.email,
				phone: resident.phone,
				carNumber: resident.carNumber,
				unitNumber: resident.unitNumber,
				residenceId: residenceId,
				createdAt: nowTimestamp,
				updatedAt: nowTimestamp,
				age: null,
				houseAddress: null,
				profilePic: null
			};

			const insertedUser = await db.insert(user).values(userData).returning();

			// Create vehicle for resident
			const vehicleData = {
				id: nanoid(),
				plateNumber: resident.carNumber,
				ownerId: insertedUser[0].id,
				model: 'Sedan',
				makeYear: 2020,
				residenceId: residenceId,
				vehicleType: 'car',
				color: 'Silver',
				isActive: true,
				accessTime: null,
				createdAt: nowTimestamp,
				updatedAt: nowTimestamp
			};

			await db.insert(vehicle).values(vehicleData);

			console.log(`✅ Created resident: ${resident.name} (${resident.username}) - Unit ${resident.unitNumber} - Car ${resident.carNumber}`);
		}

		console.log(`\n✅ Created ${residentData.length} residents\n`);

		// 4. Create Guard Users
		console.log('💂 Creating guard users...');
		const guardPassword = await hash('guard123', {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		const guardData = [
			{ guardId: 'G-001', username: 'alice.guard', name: 'Alice Smith', phone: '555-0101', shiftStart: '06:00', shiftEnd: '14:00' },
			{ guardId: 'G-002', username: 'bob.guard', name: 'Bob Johnson', phone: '555-0102', shiftStart: '14:00', shiftEnd: '22:00' },
			{ guardId: 'G-003', username: 'carlos.guard', name: 'Carlos Ruiz', phone: '555-0103', shiftStart: '22:00', shiftEnd: '06:00' }
		];

		let guardIdCounter = 1;
		for (const guardInfo of guardData) {
			const guardInsertData = {
				id: guardIdCounter++,
				username: guardInfo.username,
				passwordHash: guardPassword,
				guardId: guardInfo.guardId,
				name: guardInfo.name,
				phone: guardInfo.phone,
				residenceId: residenceId,
				shiftStartTime: guardInfo.shiftStart,
				shiftEndTime: guardInfo.shiftEnd,
				profilePic: null,
				createdAt: nowTimestamp,
				updatedAt: nowTimestamp
			};

			await db.insert(guard).values(guardInsertData);
			console.log(`✅ Created guard: ${guardInfo.name} (${guardInfo.username}) - ${guardInfo.shiftStart}-${guardInfo.shiftEnd}`);
		}

		console.log(`\n✅ Created ${guardData.length} guards (password: guard123)\n`);

		// 5. Create Sample Guest Passes
		console.log('🎫 Creating sample guest passes...');
		const tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);
		const tomorrowTimestamp = toUnixTimestamp(tomorrow);

		const guestPassData = [
			{
				id: nanoid(),
				plateNumber: 'MNO-1111',
				name: 'Michael Thompson',
				phone: '555-0301',
				visitTime: nowTimestamp,
				durationMinutes: 1440, // 24 hours
				status: 'active' as const,
				userId: insertedAdmin[0].id,
				type: 'visitors' as const,
				residenceId: residenceId,
				approvedBy: 'admin',
				notes: 'Family visit',
				entryGate: null,
				createdAt: nowTimestamp
			},
			{
				id: nanoid(),
				plateNumber: 'PQR-2222',
				name: 'Sarah Martinez',
				phone: '555-0302',
				visitTime: nowTimestamp,
				durationMinutes: 1440,
				status: 'active' as const,
				userId: insertedAdmin[0].id,
				type: 'food_delivery' as const,
				residenceId: residenceId,
				approvedBy: 'admin',
				notes: 'Food delivery service',
				entryGate: null,
				createdAt: nowTimestamp
			}
		];

		for (const pass of guestPassData) {
			await db.insert(guestPass).values(pass);
			console.log(`✅ Created guest pass: ${pass.name} - ${pass.plateNumber} (Valid for 24 hours)`);
		}

		console.log(`\n✅ Created ${guestPassData.length} guest passes\n`);

		// Summary
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
		console.log('✨ Database seeding completed successfully!\n');
		console.log('📊 Summary:');
		console.log(`   • Residences: 1`);
		console.log(`   • Admin Users: 1`);
		console.log(`   • Residents: 5`);
		console.log(`   • Vehicles: 5`);
		console.log(`   • Guards: 3`);
		console.log(`   • Guest Passes: 2\n`);
		console.log('🔐 Login Credentials:');
		console.log('   Admin:');
		console.log('   ├─ Username: admin');
		console.log('   └─ Password: admin123\n');
		console.log('   Residents (all):');
		console.log('   ├─ Usernames: john.doe, jane.smith, bob.wilson, alice.brown, charlie.davis');
		console.log('   └─ Password: resident123\n');
		console.log('   Guards (all):');
		console.log('   ├─ Usernames: alice.guard, bob.guard, carlos.guard');
		console.log('   └─ Password: guard123\n');
		console.log('🏠 Residence: Sunset Villa (RES-001)');
		console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

	} catch (error) {
		console.error('❌ Error seeding database:', error);
		process.exit(1);
	} finally {
		await client.end();
		process.exit(0);
	}
}

main();
