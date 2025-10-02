import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { guestPass } from '$lib/server/db/schema';
import { v4 as uuidv4 } from 'uuid';

import type { RequestEvent } from '@sveltejs/kit';

export const POST = async ({ request }: RequestEvent) => {
  try {
    const formData = await request.formData();
    const plateNumber = formData.get('plateNumber')?.toString();
    const durationMinutes = parseInt(formData.get('durationMinutes')?.toString() || '0', 10);
    const userId = formData.get('userId')?.toString();
    const name = formData.get('name')?.toString();
    const phone = formData.get('phone')?.toString();

    if (!plateNumber || isNaN(durationMinutes) || durationMinutes <= 0 || !userId || !name || !phone) {
      return json({ success: false, error: 'Invalid input data' }, { status: 400 });
    }

    await db.insert(guestPass).values({
      id: uuidv4(),
      plateNumber,
      durationMinutes,
      visitTime: Math.floor(Date.now() / 1000),
      type: 'food_delivery',
      userId,
      status: 'active',
      name,
      phone
    });

    return json({ success: true });
  } catch (error) {
    console.error('Error creating food delivery pass:', error);
    return json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
};