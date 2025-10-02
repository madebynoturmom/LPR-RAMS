<script lang="ts">
  import type { GuestPass } from '$lib/server/db/schema';
  import { page } from '$app/stores';
  import './subpage.css';
  import './responsive-fixes.css';

  export let data: {
    recentActivity: {
      activeGuestPasses: number;
      activeFoodDeliveryPasses: number;
      recentCarAccess: string;
    };
    activeGuestPasses: GuestPass[];
    activeFoodDeliveryPasses: GuestPass[];
  };

  export let recentActivity = data.recentActivity;
  export let activeGuestPasses = data.activeGuestPasses;
  export let activeFoodDeliveryPasses = data.activeFoodDeliveryPasses;

  // compact recent activity toggle state
  let showDetails = false;

  // UI state: which pass ids are expanded to show details
  let expandedPasses: Set<number | string> = new Set();

  function togglePass(id: number | string) {
    if (expandedPasses.has(id)) {
      expandedPasses.delete(id);
      // reassign to trigger Svelte reactivity
      expandedPasses = new Set(expandedPasses);
    } else {
      expandedPasses.add(id);
      expandedPasses = new Set(expandedPasses);
    }
  }

  const isExpanded = (id: number | string) => expandedPasses.has(id);
  import { slide } from 'svelte/transition';

  // derive user name from page data when available
  $: userName = $page.data?.user?.name || 'Resident';
</script>

<!-- Move hero into the index page so subpages don't render it -->
<div class="dashboard-hero-page">
  <div class="hero-inner-page">
    <h1 class="hero-title-page">Dashboard Overview</h1>
  </div>
</div>

<!-- Compact recent activity: shows small stat tiles and a toggle to expand full details -->
<div class="recent-activity-compact" aria-live="polite">
  <div class="recent-stats-row">
    <div class="stat-tile">
      <div class="stat-value">{recentActivity.activeGuestPasses}</div>
      <div class="stat-label">Guest Passes</div>
    </div>
    <div class="stat-tile">
      <div class="stat-value">{recentActivity.activeFoodDeliveryPasses}</div>
      <div class="stat-label">Food Delivery</div>
    </div>
  <a href="/user/dashboard/manage" class="stat-toggle" title="Manage your passes and vehicles">Manage</a>
  </div>

  <div id="recent-activity-details" class="recent-activity-card" style="display:none; margin-top:0.75rem;">
    <h3>Recent Activity</h3>
    <ul>
      <li><strong>Active Guest Passes:</strong> {recentActivity.activeGuestPasses}</li>
      <li><strong>Active Food Delivery Passes:</strong> {recentActivity.activeFoodDeliveryPasses}</li>
    </ul>
  </div>
</div>


{#if activeGuestPasses.length > 0}
<div class="active-passes-card">
  <h3>Your Active Guest Passes</h3>
  <div class="passes-list">
    {#each activeGuestPasses as pass}
      <div class="pass-item" on:click={() => togglePass(pass.id)} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && togglePass(pass.id)} aria-expanded={isExpanded(pass.id)}>
        <div class="pass-summary">
          <div class="pass-plate"><strong>{pass.plateNumber}</strong></div>
          <div class="pass-meta">{pass.name ? pass.name : ''}</div>
        </div>
        <div class="pass-actions">
          <button class="manage-link" on:click|stopPropagation={() => { /* navigate to manage */ window.location.href = '/user/dashboard/guests'; }}>Manage</button>
        </div>
        {#if isExpanded(pass.id)}
          <div class="pass-details" transition:slide={{ duration: 180 }}>
            {#if pass.name}
              <div class="pass-detail">Name: {pass.name}</div>
            {/if}
            {#if pass.phone}
              <div class="pass-detail">Phone: {pass.phone}</div>
            {/if}
            <div class="pass-detail">Visit: {new Date(pass.visitTime).toLocaleString()}</div>
            <div class="pass-detail">Duration: {pass.durationMinutes} minutes</div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
{/if}

{#if activeFoodDeliveryPasses.length > 0}
<div class="active-passes-card">
  <h3>Your Active Food Delivery Passes</h3>
  <div class="passes-list">
    {#each activeFoodDeliveryPasses as pass}
      <div class="pass-item" on:click={() => togglePass(pass.id)} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && togglePass(pass.id)} aria-expanded={isExpanded(pass.id)}>
        <div class="pass-summary">
          <div class="pass-plate"><strong>{pass.plateNumber}</strong></div>
          <div class="pass-meta">{pass.name ? pass.name : ''}</div>
        </div>
        <div class="pass-actions">
          <button class="manage-link" on:click|stopPropagation={() => { window.location.href = '/user/dashboard/food-delivery'; }}>Manage</button>
        </div>
        {#if isExpanded(pass.id)}
          <div class="pass-details" transition:slide={{ duration: 180 }}>
            {#if pass.name}
              <div class="pass-detail">Name: {pass.name}</div>
            {/if}
            {#if pass.phone}
              <div class="pass-detail">Phone: {pass.phone}</div>
            {/if}
            <div class="pass-detail">Visit: {new Date(pass.visitTime).toLocaleString()}</div>
            <div class="pass-detail">Duration: {pass.durationMinutes} minutes</div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
{/if}

<h3 class="quick-actions">Quick Actions</h3>

<div class="dashboard-cards-row">
  <a href="/user/dashboard/vehicles" class="dashboard-card">
    <div class="card-icon">🚗</div>
    <h2>Vehicles</h2>
    <p>Manage your registered vehicles.</p>
  </a>
  <a href="/user/dashboard/guests" class="dashboard-card">
    <div class="card-icon">👤</div>
    <h2>Guest Passes</h2>
    <p>View and manage your guest passes.</p>
  </a>
  <a href="/user/dashboard/food-delivery" class="dashboard-card">
    <div class="card-icon">🍱</div>
    <h2>Food Delivery</h2>
    <p>Grant access for food delivery riders.</p>
  </a>
</div>

