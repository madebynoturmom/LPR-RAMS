<script lang="ts">
  // Consolidated Manage page for admin
  const items = [
    { title: 'System Overview', href: '/admin/dashboard/manage/system-overview' },
    { title: 'Residents', href: '/admin/dashboard/residents' },
    { title: 'Guards', href: '/admin/dashboard/guards' },
    { title: 'Vehicles', href: '/admin/dashboard/vehicles' },
    { title: 'Admins', href: '/admin/dashboard/admins' },
    { title: 'Guests', href: '/admin/dashboard/guests' },
    { title: 'Events', href: '/admin/dashboard/events' }
  ];
</script>

<div class="manage-container">
  <div class="manage-card">
    <h1>Manage</h1>
    <p class="manage-desc">Manage Residents, Guards, Vehicles, Admins, and Guests from one page.</p>

    <div class="manage-list">
      {#each items as item}
        <a class="manage-item" href={item.href}>
          <span>{item.title}</span>
          <span class="arrow">→</span>
        </a>
      {/each}
    </div>
  </div>
</div>

<style>
  .manage-container { padding: 1rem 2rem 2rem 2rem; background: #f8fafc; min-height: auto; }
  .manage-card { background: #fff; padding: 1.25rem; border-radius: 12px; max-width: 760px; margin: 1rem auto; box-shadow: 0 12px 60px rgba(15,23,42,0.06); }
  h1 { margin: 0 0 0.5rem 0; font-size: 1.5rem; color: #0f172a; }
  .manage-desc { color: #374151; margin: 0 0 1rem 0; }
  .manage-list { display:flex; flex-direction:column; gap: 0.75rem; max-width: 720px; margin: 0 auto; }
  .manage-item { display:flex; justify-content:space-between; align-items:center; background: #ffffff; padding: 0.9rem 1rem; border-radius: 12px; text-decoration:none; color: #0f172a; border: 1px solid #eef6fb; box-shadow: 0 6px 18px rgba(16,24,40,0.06); }
  .manage-item .arrow { color: #6b7280; }
  @media (max-width: 640px) { .manage-card { margin: 0.5rem 0.75rem; } }
  @media (max-width: 640px) { .manage-container { padding: 0.5rem 0.75rem; } }
</style>
