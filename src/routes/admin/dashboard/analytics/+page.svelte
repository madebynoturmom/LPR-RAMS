<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import Chart from 'chart.js/auto';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  export let data: {
    user: any;
    currentResidence: any;
    availableResidences: any[];
    selectedResidenceId: string;
    analytics: {
      totals: {
        residents: number;
        vehicles: number;
        guestPasses: number;
        activeGuestPasses: number;
        activeFoodDeliveryPasses: number;
      };
      trends: {
        guestPasses: { date: string; count: number }[];
        vehicles: { date: string; count: number }[];
      };
      recent: {
        guestPasses: any[];
        vehicles: any[];
      };
    };
  };

  let guestPassChart: Chart | null = null;
  let vehicleChart: Chart | null = null;
  let guestPassCanvas: HTMLCanvasElement;
  let vehicleCanvas: HTMLCanvasElement;
  let selectedResidence = data.selectedResidenceId;

  // Chart colors
  const chartColors = {
    primary: '#6366f1',
    secondary: '#10b981',
    accent: '#f59e0b',
    danger: '#ef4444',
    background: 'rgba(99, 102, 241, 0.1)',
    secondaryBackground: 'rgba(16, 185, 129, 0.1)'
  };

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  function createGuestPassChart() {
    if (!guestPassCanvas || !browser) return;
    
    if (guestPassChart) {
      guestPassChart.destroy();
    }

    const labels = data.analytics.trends.guestPasses.map(item => formatDate(item.date));
    const guestData = data.analytics.trends.guestPasses.map(item => item.count);

    guestPassChart = new Chart(guestPassCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Guest Passes Issued',
          data: guestData,
          borderColor: chartColors.primary,
          backgroundColor: chartColors.background,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: chartColors.primary,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            display: false 
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: chartColors.primary,
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6b7280', maxTicksLimit: 6 }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f3f4f6' },
            ticks: { color: '#6b7280' }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  function createVehicleChart() {
    if (!vehicleCanvas || !browser) return;
    
    if (vehicleChart) {
      vehicleChart.destroy();
    }

    const labels = data.analytics.trends.vehicles.map(item => formatDate(item.date));
    const vehicleData = data.analytics.trends.vehicles.map(item => item.count);

    vehicleChart = new Chart(vehicleCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Vehicle Registrations',
          data: vehicleData,
          backgroundColor: chartColors.secondary,
          borderColor: chartColors.secondary,
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            display: false 
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: chartColors.secondary,
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6b7280' }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f3f4f6' },
            ticks: { color: '#6b7280' }
          }
        }
      }
    });
  }

  function onResidenceChange() {
    const url = new URL($page.url);
    if (selectedResidence !== data.selectedResidenceId) {
      url.searchParams.set('residence', selectedResidence);
    } else {
      url.searchParams.delete('residence');
    }
    goto(url.toString());
  }

  onMount(() => {
    createGuestPassChart();
    createVehicleChart();
  });

  onDestroy(() => {
    if (guestPassChart) guestPassChart.destroy();
    if (vehicleChart) vehicleChart.destroy();
  });

  $: if (browser && guestPassCanvas && data.analytics.trends.guestPasses) {
    createGuestPassChart();
  }

  $: if (browser && vehicleCanvas && data.analytics.trends.vehicles) {
    createVehicleChart();
  }
</script>

<svelte:head>
  <title>Analytics - {data.currentResidence?.name || 'Dashboard'}</title>
  <link rel="stylesheet" href="/admin/dashboard/subpage.css" />
</svelte:head>

<div class="subpage-container">
  <div class="subpage-card">
    <div class="subpage-header">
      <div>
        <h2 class="subpage-title">Analytics Dashboard</h2>
        <p class="text-gray-500 mt-2">
          Insights and trends for {data.currentResidence?.name || 'your residence'}
        </p>
      </div>
      
      <!-- Residence Selector - Hidden for now, only single residence support -->
      {#if data.availableResidences.length > 1}
        <div class="subpage-actions">
          <select 
            bind:value={selectedResidence} 
            on:change={onResidenceChange}
            class="px-2 py-2 border border-gray-300 rounded-md"
          >
            {#each data.availableResidences as residence}
              <option value={residence.id}>{residence.name}</option>
            {/each}
          </select>
        </div>
      {/if}
    </div>

<div class="analytics-container">
  <!-- Header -->
  <div class="analytics-header">
    <div class="header-content">
      <div class="header-text">
        <h1 class="page-title">Analytics Dashboard</h1>
        <p class="page-subtitle">
          Insights and trends for {data.currentResidence?.name || 'your residence'}
        </p>
      </div>
      
      <!-- Residence Selector - Hidden for now, only single residence support -->
      {#if data.availableResidences.length > 1}
        <div class="residence-selector">
          <label for="residence-select" class="selector-label">Residence:</label>
          <select 
            id="residence-select"
            bind:value={selectedResidence} 
            on:change={onResidenceChange}
            class="residence-select"
          >
            {#each data.availableResidences as residence}
              <option value={residence.id}>{residence.name}</option>
            {/each}
          </select>
        </div>
      {/if}
    </div>
  </div>

  <!-- Stats Overview -->
  <section class="stats-section">
    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-content">
          <div class="stat-value">{data.analytics.totals.residents}</div>
          <div class="stat-label">Total Residents</div>
        </div>
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </div>

      <div class="stat-card secondary">
        <div class="stat-content">
          <div class="stat-value">{data.analytics.totals.vehicles}</div>
          <div class="stat-label">Registered Vehicles</div>
        </div>
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
            <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
            <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2"></path>
          </svg>
        </div>
      </div>

      <div class="stat-card accent">
        <div class="stat-content">
          <div class="stat-value">{data.analytics.totals.activeGuestPasses}</div>
          <div class="stat-label">Active Guest Passes</div>
        </div>
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
      </div>

      <div class="stat-card danger">
        <div class="stat-content">
          <div class="stat-value">{data.analytics.totals.activeFoodDeliveryPasses}</div>
          <div class="stat-label">Food Delivery Passes</div>
        </div>
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8m8 0V9a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4.01"></path>
          </svg>
        </div>
      </div>
    </div>
  </section>

  <!-- Charts Section -->
  <section class="charts-section">
    <div class="charts-grid">
      <!-- Guest Pass Trends -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Guest Pass Trends</h3>
          <p class="chart-subtitle">Last 30 days</p>
        </div>
        <div class="chart-container">
          <canvas bind:this={guestPassCanvas} class="chart-canvas"></canvas>
        </div>
      </div>

      <!-- Vehicle Registration Trends -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Vehicle Registrations</h3>
          <p class="chart-subtitle">Last 30 days</p>
        </div>
        <div class="chart-container">
          <canvas bind:this={vehicleCanvas} class="chart-canvas"></canvas>
        </div>
      </div>
    </div>
  </section>

  <!-- Recent Activity -->
  <section class="activity-section">
    <div class="activity-grid">
      <!-- Recent Guest Passes -->
      <div class="activity-card">
        <div class="activity-header">
          <h3 class="activity-title">Recent Guest Passes</h3>
          <a href="/admin/dashboard/guests" class="activity-link">View All</a>
        </div>
        <div class="activity-list">
          {#each data.analytics.recent.guestPasses.slice(0, 5) as pass}
            <div class="activity-item">
              <div class="activity-icon {pass.type === 'food_delivery' ? 'delivery' : 'guest'}">
                {#if pass.type === 'food_delivery'}
                  🍕
                {:else}
                  👥
                {/if}
              </div>
              <div class="activity-content">
                <div class="activity-primary">{pass.name || 'Guest'}</div>
                <div class="activity-secondary">{pass.plateNumber || 'No plate'}</div>
              </div>
              <div class="activity-meta">
                <span class="activity-status {pass.status}">{pass.status}</span>
                <span class="activity-time">{new Date(pass.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          {/each}
          {#if data.analytics.recent.guestPasses.length === 0}
            <div class="activity-empty">No recent guest passes</div>
          {/if}
        </div>
      </div>

      <!-- Recent Vehicle Registrations -->
      <div class="activity-card">
        <div class="activity-header">
          <h3 class="activity-title">Recent Vehicles</h3>
          <a href="/admin/dashboard/vehicles" class="activity-link">View All</a>
        </div>
        <div class="activity-list">
          {#each data.analytics.recent.vehicles as vehicle}
            <div class="activity-item">
              <div class="activity-icon vehicle">
                🚗
              </div>
              <div class="activity-content">
                <div class="activity-primary">{vehicle.plateNumber}</div>
                <div class="activity-secondary">{vehicle.ownerName}</div>
              </div>
              <div class="activity-meta">
                <span class="activity-time">{new Date(vehicle.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          {/each}
          {#if data.analytics.recent.vehicles.length === 0}
            <div class="activity-empty">No recent vehicle registrations</div>
          {/if}
        </div>
      </div>
    </div>
  </section>
  </div>
</div>
</div>

<style>
  .analytics-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .analytics-container > * + * {
    margin-top: 2rem;
  }

  .analytics-header {
    margin-bottom: 2rem;
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (min-width: 768px) {
    .header-content {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }

  .header-text {
    flex: 1;
  }

  .page-title {
    font-size: 1.875rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 0.5rem 0;
  }

  .page-subtitle {
    color: #64748b;
    font-size: 1rem;
    margin: 0;
  }

  .residence-selector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  @media (min-width: 768px) {
    .residence-selector {
      flex-direction: row;
      align-items: center;
    }
  }

  .selector-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  .residence-select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    background: white;
    font-size: 0.875rem;
    min-width: 200px;
  }

  .residence-select:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  /* Stats Section */
  .stats-section {
    margin-bottom: 2rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 640px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .stats-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .stat-card {
    background: white;
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }

  .stat-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 1rem;
  }

  .stat-card.primary .stat-value { color: #6366f1; }
  .stat-card.primary .stat-icon { background: rgba(99, 102, 241, 0.1); color: #6366f1; }

  .stat-card.secondary .stat-value { color: #10b981; }
  .stat-card.secondary .stat-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }

  .stat-card.accent .stat-value { color: #f59e0b; }
  .stat-card.accent .stat-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

  .stat-card.danger .stat-value { color: #ef4444; }
  .stat-card.danger .stat-icon { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

  /* Charts Section */
  .charts-section {
    margin-bottom: 2rem;
  }

  .charts-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    .charts-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .chart-card {
    background: white;
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
  }

  .chart-header {
    margin-bottom: 1rem;
  }

  .chart-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.25rem 0;
  }

  .chart-subtitle {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }

  .chart-container {
    height: 300px;
    position: relative;
  }

  .chart-canvas {
    width: 100% !important;
    height: 100% !important;
  }

  /* Activity Section */
  .activity-section {
    margin-bottom: 2rem;
  }

  .activity-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    .activity-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .activity-card {
    background: white;
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
  }

  .activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .activity-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }

  .activity-link {
    font-size: 0.875rem;
    color: #6366f1;
    text-decoration: none;
    font-weight: 500;
  }

  .activity-link:hover {
    text-decoration: underline;
  }

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    background: #f8fafc;
  }

  .activity-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .activity-icon.guest { background: rgba(99, 102, 241, 0.1); }
  .activity-icon.delivery { background: rgba(245, 158, 11, 0.1); }
  .activity-icon.vehicle { background: rgba(16, 185, 129, 0.1); }

  .activity-content {
    flex: 1;
    min-width: 0;
  }

  .activity-primary {
    font-weight: 500;
    color: #111827;
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .activity-secondary {
    font-size: 0.75rem;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .activity-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .activity-status {
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    font-weight: 500;
  }

  .activity-status.active {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
  }

  .activity-status.expired {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
  }

  .activity-time {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .activity-empty {
    text-align: center;
    color: #9ca3af;
    font-size: 0.875rem;
    padding: 2rem;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .analytics-container {
      background: #0f172a;
    }

    .page-title {
      color: #f1f5f9;
    }

    .page-subtitle {
      color: #94a3b8;
    }

    .stat-card,
    .chart-card,
    .activity-card {
      background: #1e293b;
      border-color: #334155;
    }

    .stat-label,
    .chart-subtitle,
    .activity-secondary {
      color: #94a3b8;
    }

    .chart-title,
    .activity-title,
    .activity-primary {
      color: #f1f5f9;
    }

    .activity-item {
      background: #334155;
    }

    .residence-select {
      background: #1e293b;
      border-color: #334155;
      color: #f1f5f9;
    }
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    .analytics-container {
      padding: 0.75rem;
    }

    .page-title {
      font-size: 1.5rem;
    }

    .stat-card {
      padding: 1rem;
    }

    .stat-value {
      font-size: 1.5rem;
    }

    .chart-container {
      height: 250px;
    }

    .activity-meta {
      align-items: flex-start;
    }

    .activity-status {
      font-size: 0.625rem;
      padding: 0.125rem 0.375rem;
    }
  }
</style>