<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';

  export let data: {
    residents?: number;
    guards?: number;
    vehicles?: number;
    users?: number;
    admins?: number;
    guests?: number;
    events?: number;
    guestStats?: { date: string; count: number }[];
    activeGuestPasses: number;
    activeFoodDeliveryPasses: number;
    recentCarAccess: string;
  };

  let chart: Chart;
  let chartCanvas: HTMLCanvasElement;

  onMount(() => {
    if (data?.guestStats && chartCanvas) {
      if (chart) chart.destroy();
      chart = new Chart(chartCanvas, {
        type: 'line',
        data: {
          labels: data.guestStats.map(g => g.date),
          datasets: [{
            label: 'Guests Issued',
            data: data.guestStats.map(g => g.count),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#fff',
              bodyColor: '#fff'
            }
          },
          scales: {
            x: { title: { display: true, text: 'Date', color: '#6b7280' }, grid: { display: false }, ticks: { color: '#6b7280' } },
            y: { title: { display: true, text: 'Guests', color: '#6b7280' }, beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { color: '#6b7280' } }
          }
        }
      });

      onDestroy(() => {
        if (chart) chart.destroy();
      });
    }
  });

  interface StatItem { label: string; value: number; link: string; iconPath?: string; icon?: string }

  const stats: StatItem[] = [
    { label: 'Residents', value: data.residents || 0, link: '/admin/dashboard/residents', iconPath: '/icons/system-residents.svg' },
    { label: 'Guards', value: data.guards || 0, link: '/admin/dashboard/guards', iconPath: '/icons/system-guards.svg' },
    { label: 'Vehicles', value: data.vehicles || 0, link: '/admin/dashboard/vehicles', iconPath: '/icons/system-vehicles.svg' },
    { label: 'Admins', value: data.admins || 0, link: '/admin/dashboard/admins', iconPath: '/icons/system-admins.svg' },
    { label: 'Guests', value: data.guests || 0, link: '/admin/dashboard/guests', iconPath: '/icons/system-guests.svg' },
    { label: 'Events', value: data.events || 0, link: '/admin/dashboard/events', iconPath: '/icons/system-events.svg' }
  ];
</script>

<div class="page-header">
  <a href="/admin/dashboard/manage" class="manage-button" aria-label="Back to Manage">
    <span class="manage-icon" aria-hidden="true">
      <!-- subtle chevron-left icon -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </span>
    <span class="manage-text">Manage</span>
  </a>
  <h2 class="page-title">System Overview</h2>
</div>

<!-- Statistics Overview -->
<section class="stats-section">
  <div class="stats-grid">
    {#each stats as stat}
      <a href={stat.link} class="stat-card">
        <div class="stat-header">
          <div class="stat-icon">
            {#if stat.iconPath}
              <img src={stat.iconPath} alt="{stat.label} icon" width="40" height="40" />
            {:else}
              {stat.icon}
            {/if}
          </div>
          <div class="stat-value">{stat.value}</div>
        </div>
        <div class="stat-label">{stat.label}</div>
        <div class="stat-link">View Details →</div>
      </a>
    {/each}
  </div>
</section>

<!-- Charts and Activity Row -->
<div class="charts-activity-row">
  <!-- Guest Statistics Chart -->
  <section class="chart-section">
    <div class="chart-card">
      <div class="chart-header">
        <h3 class="chart-title">Guest Passes Trend</h3>
        <p class="chart-subtitle">Last 7 days activity</p>
      </div>
      <div class="chart-container">
        <canvas bind:this={chartCanvas}></canvas>
      </div>
    </div>
  </section>

  <!-- Recent Activity -->
  <section class="activity-section">
    <div class="activity-card">
      <div class="activity-header">
        <h3 class="activity-title">Recent Activity</h3>
        <p class="activity-subtitle">Live updates</p>
      </div>
      <div class="activity-list">
        <div class="activity-item">
          <div class="activity-icon bg-green-100 text-green-600">🎫</div>
          <div class="activity-content">
            <p class="activity-text"><strong>{data.activeGuestPasses}</strong> active guest passes</p>
            <p class="activity-time">Currently valid</p>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-icon bg-blue-100 text-blue-600">🍕</div>
          <div class="activity-content">
            <p class="activity-text"><strong>{data.activeFoodDeliveryPasses}</strong> food delivery passes</p>
            <p class="activity-time">Active today</p>
          </div>
        </div>
        <div class="activity-item">
          <div class="activity-icon bg-purple-100 text-purple-600">🚗</div>
          <div class="activity-content">
            <p class="activity-text">Recent vehicle access</p>
            <p class="activity-time">{data.recentCarAccess}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .page-title { margin:0; }

  /* Manage button styles */
  .page-header { display:flex; align-items:center; gap:0.75rem; margin-bottom:0.5rem; }
  .manage-button {
    display:inline-flex;
    align-items:center;
    gap:0.5rem;
    padding:0.4rem 0.6rem;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    border: 1px solid rgba(99,102,241,0.12);
    color:#374151;
    border-radius:8px;
    box-shadow: 0 6px 14px rgba(99,102,241,0.06);
    text-decoration:none;
    font-weight:600;
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }
  .manage-button:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(99,102,241,0.09); }
  .manage-button:active { transform: translateY(0); }
  .manage-button:focus { outline: 3px solid rgba(99,102,241,0.18); outline-offset: 2px; }
  .manage-icon { display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; color:#6366f1; }
  .manage-text { color:#111827; font-size:0.95rem; }

  .stats-section { margin-bottom: 1.5rem; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; max-width: 100%; }

  .stat-card { background: white; border-radius: 12px; padding: 1.25rem; text-decoration: none; color: inherit; transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; position: relative; overflow: hidden; }
  .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #6366f1, #8b5cf6); }
  .stat-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem; }
  .stat-icon { font-size: 1.6rem; opacity: 0.9; }
  .stat-icon img { width: 40px; height: 40px; display: block; }
  .stat-value { font-size: clamp(1.25rem, 3vw, 2rem); font-weight:700; color:#1f2937; }
  .stat-label { color:#6b7280; font-weight:500; }

  .charts-activity-row { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 1.5rem; align-items: start; }
  .chart-card, .activity-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
  .chart-container { aspect-ratio: 16/9; height: auto; width: 100%; }
  .activity-list { display:flex; flex-direction:column; gap:1rem; }
  .activity-item { display:flex; align-items:center; gap:0.75rem; }

  @media (max-width: 1024px) { .charts-activity-row { grid-template-columns: 1fr; } }
  @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); } .chart-container { aspect-ratio: 4/3; } }
</style>
