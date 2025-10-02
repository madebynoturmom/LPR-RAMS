<script lang="ts">
  // User-specific manage links
  const items = [
    { title: 'Guest Passes', href: '/user/dashboard/guests', description: 'Manage visitor access passes' },
    { title: 'Vehicles', href: '/user/dashboard/vehicles', description: 'Manage your registered vehicles' },
    { title: 'Food Delivery', href: '/user/dashboard/food-delivery', description: 'Manage food delivery access' }
  ];
</script>

<div class="manage-card">
  <h1>Manage</h1>
  <p class="manage-desc">Manage your guest passes, vehicles, and food delivery access.</p>

  <div class="manage-list">
    {#each items as item}
      <a class="manage-item" href={item.href}>
        <div class="item-content">
          <span class="item-title">{item.title}</span>
          <span class="item-desc">{item.description}</span>
        </div>
        <span class="arrow">→</span>
      </a>
    {/each}
  </div>
</div>


