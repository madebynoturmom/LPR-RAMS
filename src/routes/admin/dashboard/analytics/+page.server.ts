import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user, guestPass, residence, residenceAdmin } from '$lib/server/db/schema';
import { vehicle } from '$lib/server/db/vehicle';
import { eq, sql, and, gte, lte, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url, parent }) => {
  const authUser = locals.user;
  
  if (!authUser) {
    throw redirect(302, '/login');
  }

  if (authUser.role !== 'admin') {
    throw redirect(302, '/');
  }

  // Get admin data from parent layout
  const { user: adminData } = await parent();
  
  // Get selected residence from URL params or default to admin's residence
  const selectedResidenceId = url.searchParams.get('residence') || adminData.residenceId;
  
  try {
    // Get all residences for residence selector (admins can only see their own residence)
    let availableResidences: any[] = [];
    if (adminData.residenceId) {
      // Regular admin can only see their own residence
      const adminResidence = await db.select().from(residence).where(eq(residence.id, adminData.residenceId));
      availableResidences = adminResidence;
    }

    // Determine which residence to show analytics for
    const analyticsResidenceId = selectedResidenceId || adminData.residenceId;
    
    if (!analyticsResidenceId) {
      // Return empty analytics if no residence
      return {
        user: adminData,
        currentResidence: null,
        availableResidences: [],
        selectedResidenceId: null,
        analytics: {
          totals: {
            residents: 0,
            vehicles: 0,
            guestPasses: 0,
            activeGuestPasses: 0,
            activeFoodDeliveryPasses: 0
          },
          trends: {
            guestPasses: [],
            vehicles: []
          },
          recent: {
            guestPasses: [],
            vehicles: []
          }
        }
      };
    }

    // Get residence info
    const residenceInfo = await db.select().from(residence).where(eq(residence.id, analyticsResidenceId)).limit(1);
    const currentResidence = residenceInfo[0];

    // Get analytics data for the selected residence
    const [
      residentsCount,
      vehiclesCount,
      guestPassesCount,
      activeGuestPassesCount,
      activeFoodDeliveryPassesCount
    ] = await Promise.all([
      // Total residents
      db.select({ count: sql<number>`count(*)` })
        .from(user)
        .where(and(
          eq(user.residenceId, analyticsResidenceId),
          eq(user.role, 'resident')
        )),
      
      // Total vehicles
      db.select({ count: sql<number>`count(*)` })
        .from(vehicle)
        .where(eq(vehicle.residenceId, analyticsResidenceId)),
      
      // Total guest passes (all time)
      db.select({ count: sql<number>`count(*)` })
        .from(guestPass)
        .where(eq(guestPass.residenceId, analyticsResidenceId)),
      
      // Active guest passes (visitors)
      db.select({ count: sql<number>`count(*)` })
        .from(guestPass)
        .where(and(
          eq(guestPass.residenceId, analyticsResidenceId),
          eq(guestPass.type, 'visitors'),
          eq(guestPass.status, 'active')
        )),
      
      // Active food delivery passes
      db.select({ count: sql<number>`count(*)` })
        .from(guestPass)
        .where(and(
          eq(guestPass.residenceId, analyticsResidenceId),
          eq(guestPass.type, 'food_delivery'),
          eq(guestPass.status, 'active')
        ))
    ]);

    // Get guest pass trends for the last 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const guestPassTrends = await db
      .select({
        date: sql<string>`DATE(to_timestamp(${guestPass.createdAt}))`,
        count: sql<number>`count(*)`
      })
      .from(guestPass)
      .where(and(
        eq(guestPass.residenceId, analyticsResidenceId),
        gte(guestPass.createdAt, Math.floor(thirtyDaysAgo / 1000))
      ))
      .groupBy(sql`DATE(to_timestamp(${guestPass.createdAt}))`)
      .orderBy(sql`DATE(to_timestamp(${guestPass.createdAt}))`);

    // Get vehicle registration trends for the last 30 days
    const vehicleTrends = await db
      .select({
        date: sql<string>`DATE(to_timestamp(${vehicle.createdAt}))`,
        count: sql<number>`count(*)`
      })
      .from(vehicle)
      .where(and(
        eq(vehicle.residenceId, analyticsResidenceId),
        gte(vehicle.createdAt, Math.floor(thirtyDaysAgo / 1000))
      ))
      .groupBy(sql`DATE(to_timestamp(${vehicle.createdAt}))`)
      .orderBy(sql`DATE(to_timestamp(${vehicle.createdAt}))`);

    // Get recent guest passes for activity feed
    const recentGuestPasses = await db
      .select({
        id: guestPass.id,
        type: guestPass.type,
        name: guestPass.name,
        plateNumber: guestPass.plateNumber,
        createdAt: guestPass.createdAt,
        status: guestPass.status
      })
      .from(guestPass)
      .where(eq(guestPass.residenceId, analyticsResidenceId))
      .orderBy(desc(guestPass.createdAt))
      .limit(10);

    // Get recent vehicle registrations
    const recentVehicles = await db
      .select({
        id: vehicle.id,
        plateNumber: vehicle.plateNumber,
        ownerId: vehicle.ownerId,
        model: vehicle.model,
        createdAt: vehicle.createdAt
      })
      .from(vehicle)
      .where(eq(vehicle.residenceId, analyticsResidenceId))
      .orderBy(desc(vehicle.createdAt))
      .limit(5);

    return {
      user: adminData,
      currentResidence,
      availableResidences,
      selectedResidenceId: analyticsResidenceId,
      analytics: {
        totals: {
          residents: residentsCount[0]?.count || 0,
          vehicles: vehiclesCount[0]?.count || 0,
          guestPasses: guestPassesCount[0]?.count || 0,
          activeGuestPasses: activeGuestPassesCount[0]?.count || 0,
          activeFoodDeliveryPasses: activeFoodDeliveryPassesCount[0]?.count || 0
        },
        trends: {
          guestPasses: guestPassTrends.map((item: any) => ({
            date: item.date,
            count: Number(item.count)
          })),
          vehicles: vehicleTrends.map((item: any) => ({
            date: item.date,
            count: Number(item.count)
          }))
        },
        recent: {
          guestPasses: recentGuestPasses.map((pass: any) => ({
            ...pass,
            createdAt: new Date(pass.createdAt * 1000).toISOString()
          })),
          vehicles: recentVehicles.map((v: any) => ({
            ...v,
            ownerName: v.model || 'Unknown',
            createdAt: new Date(v.createdAt * 1000).toISOString()
          }))
        }
      }
    };
  } catch (error) {
    console.error('Analytics load error:', error);
    throw redirect(302, '/admin/dashboard');
  }
};