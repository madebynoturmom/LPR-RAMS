import { load as adminLoad } from '../../+page.server';

export const load = async (event) => {
  // Reuse the admin dashboard load to get stats and activity data
  const data = await adminLoad(event as any);
  return data;
};
