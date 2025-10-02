import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

/**
 * Utility functions for multi-residence database queries
 * All queries automatically filter by residence_id for data isolation
 */

export type ResidenceContext = {
  residenceId: string | null;
  role: 'super_admin' | 'residence_admin' | 'admin' | 'guard' | 'resident';
};

/**
 * Create a residence filter condition
 * Super admins can access all data, others are restricted to their residence
 */
export function createResidenceFilter(context: ResidenceContext, residenceIdColumn: any) {
  if (context.role === 'super_admin') {
    // Super admins can access all residences
    return undefined;
  }
  
  if (!context.residenceId) {
    throw new Error('No residence access for non-super admin user');
  }
  
  return eq(residenceIdColumn, context.residenceId);
}

/**
 * Get all users (residents/guards) for a residence
 */
export async function getResidenceUsers(context: ResidenceContext) {
  const filter = createResidenceFilter(context, table.user.residenceId);
  
  if (filter) {
    return await db.select().from(table.user).where(filter);
  } else {
    // Super admin - return all users with residence info
    return await db
      .select({
        user: table.user,
        residence: table.residence
      })
      .from(table.user)
      .leftJoin(table.residence, eq(table.user.residenceId, table.residence.id));
  }
}

/**
 * Get all vehicles for a residence
 */
export async function getResidenceVehicles(context: ResidenceContext) {
  const filter = createResidenceFilter(context, table.vehicle.residenceId);
  
  if (filter) {
    return await db.select().from(table.vehicle).where(filter);
  } else {
    // Super admin - return all vehicles with residence info
    return await db
      .select({
        vehicle: table.vehicle,
        residence: table.residence
      })
      .from(table.vehicle)
      .leftJoin(table.residence, eq(table.vehicle.residenceId, table.residence.id));
  }
}

/**
 * Get all guest passes for a residence
 */
export async function getResidenceGuestPasses(context: ResidenceContext) {
  const filter = createResidenceFilter(context, table.guestPass.residenceId);
  
  if (filter) {
    return await db.select().from(table.guestPass).where(filter);
  } else {
    // Super admin - return all guest passes with residence info
    return await db
      .select({
        guestPass: table.guestPass,
        residence: table.residence
      })
      .from(table.guestPass)
      .leftJoin(table.residence, eq(table.guestPass.residenceId, table.residence.id));
  }
}

/**
 * Get all guards for a residence
 */
export async function getResidenceGuards(context: ResidenceContext) {
  const filter = createResidenceFilter(context, table.guard.residenceId);
  
  if (filter) {
    return await db.select().from(table.guard).where(filter);
  } else {
    // Super admin - return all guards with residence info
    return await db
      .select({
        guard: table.guard,
        residence: table.residence
      })
      .from(table.guard)
      .leftJoin(table.residence, eq(table.guard.residenceId, table.residence.id));
  }
}

/**
 * Get event logs for a residence
 */
export async function getResidenceEventLogs(context: ResidenceContext, limit: number = 100) {
  const filter = createResidenceFilter(context, table.eventLog.residenceId);
  
  if (filter) {
    return await db.select().from(table.eventLog).where(filter).limit(limit).orderBy(table.eventLog.timestamp);
  } else {
    // Super admin - return all event logs with residence info
    return await db
      .select({
        eventLog: table.eventLog,
        residence: table.residence
      })
      .from(table.eventLog)
      .leftJoin(table.residence, eq(table.eventLog.residenceId, table.residence.id))
      .limit(limit)
      .orderBy(table.eventLog.timestamp);
  }
}

/**
 * Create a new user with residence context
 */
export async function createResidenceUser(context: ResidenceContext, userData: any) {
  if (context.role === 'super_admin') {
    // Super admin can create users for any residence (must specify residenceId)
    if (!userData.residenceId) {
      throw new Error('Super admin must specify residence_id when creating users');
    }
  } else {
    // Other admins can only create users for their own residence
    userData.residenceId = context.residenceId;
  }
  
  return await db.insert(table.user).values(userData).returning();
}

/**
 * Create a new vehicle with residence context
 */
export async function createResidenceVehicle(context: ResidenceContext, vehicleData: any) {
  if (context.role === 'super_admin') {
    // Super admin can create vehicles for any residence (must specify residenceId)
    if (!vehicleData.residenceId) {
      throw new Error('Super admin must specify residence_id when creating vehicles');
    }
  } else {
    // Other admins can only create vehicles for their own residence
    vehicleData.residenceId = context.residenceId;
  }
  
  return await db.insert(table.vehicle).values(vehicleData).returning();
}

/**
 * Create a new guest pass with residence context
 */
export async function createResidenceGuestPass(context: ResidenceContext, guestPassData: any) {
  if (context.role === 'super_admin') {
    // Super admin can create guest passes for any residence (must specify residenceId)
    if (!guestPassData.residenceId) {
      throw new Error('Super admin must specify residence_id when creating guest passes');
    }
  } else {
    // Other users can only create guest passes for their own residence
    guestPassData.residenceId = context.residenceId;
  }
  
  return await db.insert(table.guestPass).values(guestPassData).returning();
}

/**
 * Get residence information (for super admins) or current residence (for others)
 */
export async function getResidenceInfo(context: ResidenceContext, specificResidenceId?: string) {
  if (context.role === 'super_admin') {
    if (specificResidenceId) {
      return await db.select().from(table.residence).where(eq(table.residence.id, specificResidenceId));
    } else {
      // Return all residences for super admin
      return await db.select().from(table.residence);
    }
  } else {
    if (!context.residenceId) {
      throw new Error('No residence access for user');
    }
    // Return only the user's residence
    return await db.select().from(table.residence).where(eq(table.residence.id, context.residenceId));
  }
}

/**
 * Validate residence access for a user
 */
export function validateResidenceAccess(context: ResidenceContext, targetResidenceId: string): boolean {
  if (context.role === 'super_admin') {
    return true; // Super admins can access any residence
  }
  
  return context.residenceId === targetResidenceId;
}

/**
 * Get residence statistics
 */
export async function getResidenceStats(context: ResidenceContext) {
  const residenceFilter = createResidenceFilter(context, table.user.residenceId);
  
  if (context.role === 'super_admin') {
    // Return stats for all residences
    const residences = await db.select().from(table.residence);
    const stats = await Promise.all(
      residences.map(async (residence: typeof table.residence.$inferSelect) => {
        const [userCount] = await db.select({ count: db.count() }).from(table.user).where(eq(table.user.residenceId, residence.id));
        const [vehicleCount] = await db.select({ count: db.count() }).from(table.vehicle).where(eq(table.vehicle.residenceId, residence.id));
        const [guestPassCount] = await db.select({ count: db.count() }).from(table.guestPass).where(eq(table.guestPass.residenceId, residence.id));
        
        return {
          residence,
          userCount: userCount.count,
          vehicleCount: vehicleCount.count,
          guestPassCount: guestPassCount.count
        };
      })
    );
    return stats;
  } else {
    // Return stats for user's residence only
    if (!context.residenceId) {
      throw new Error('No residence access for user');
    }
    
    const [residence] = await db.select().from(table.residence).where(eq(table.residence.id, context.residenceId));
    const [userCount] = await db.select({ count: db.count() }).from(table.user).where(eq(table.user.residenceId, context.residenceId));
    const [vehicleCount] = await db.select({ count: db.count() }).from(table.vehicle).where(eq(table.vehicle.residenceId, context.residenceId));
    const [guestPassCount] = await db.select({ count: db.count() }).from(table.guestPass).where(eq(table.guestPass.residenceId, context.residenceId));
    
    return [{
      residence,
      userCount: userCount.count,
      vehicleCount: vehicleCount.count,
      guestPassCount: guestPassCount.count
    }];
  }
}