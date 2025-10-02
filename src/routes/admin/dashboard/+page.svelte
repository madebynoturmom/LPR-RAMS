<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';

  export let data: {
    residents: number;
    guards: number;
    vehicles: number;
    users: number;
    admins: number;
    guests: number;
    events: number;
    guestStats?: { date: string; count: number }[];
    activeGuestPasses: number;
    activeFoodDeliveryPasses: number;
    recentCarAccess: string;
    adminUsername?: string;
    adminProfilePic?: string;
  };

  let chart: Chart | null = null;
  let chartCanvas: HTMLCanvasElement | null = null;
  let issuedChart: Chart | null = null;
  let issuedCanvas: HTMLCanvasElement | null = null;
  // Chart range selection: '7d' | '1m' | '3m'
  let selectedRange: '7d' | '1m' | '3m' = '7d';

  const rangeToDays = (r: typeof selectedRange) => (r === '7d' ? 7 : r === '1m' ? 30 : 90);

  const getFilteredStats = (r: typeof selectedRange) => {
    if (!data?.guestStats || !data.guestStats.length) return [] as { date: string; count: number }[];
    const days = rangeToDays(r);
    // take last N entries (assumes guestStats is chronological)
    return data.guestStats.slice(Math.max(0, data.guestStats.length - days));
  };
  const dateString = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  interface QuickAction {
    title: string;
    description: string;
    link: string;
    color?: string;
    iconSvg?: string;
    iconPath?: string;
  }

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
            x: {
              title: { display: true, text: 'Date', color: '#6b7280' },
              grid: { display: false },
              ticks: { color: '#6b7280' }
            },
            y: {
              title: { display: true, text: 'Guests', color: '#6b7280' },
              beginAtZero: true,
              grid: { color: '#f3f4f6' },
              ticks: { color: '#6b7280' }
            }
          }
        }
      });

      onDestroy(() => {
        if (chart) {
          chart.destroy();
        }
      });
    }
  });

  const stats = [
    { label: 'Residents', value: data.residents, link: '/admin/dashboard/residents', icon: '👥' },
    { label: 'Guards', value: data.guards, link: '/admin/dashboard/guards', icon: '🛡️' },
    { label: 'Vehicles', value: data.vehicles, link: '/admin/dashboard/vehicles', icon: '🚗' },
    { label: 'Admins', value: data.admins, link: '/admin/dashboard/admins', icon: '👑' },
    { label: 'Guests', value: data.guests, link: '/admin/dashboard/guests', icon: '🎟️' },
    { label: 'Events', value: data.events, link: '/admin/dashboard/events', icon: '📈' }
  ];

  // Use SVG placeholders instead of emoji so icons are consistent across platforms
  const placeholderSvg = (stroke = '#ffffff') => `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="currentColor" />
      <path d="M8 12h8" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`;

  const quickActions: QuickAction[] = [
    // Using static SVG paths under /static/icons/ (dummy placeholders created)
    { title: 'Add Resident', description: 'Register a new resident', link: '/admin/dashboard/residents/create', iconPath: '/icons/add-resident.svg', color: 'bg-blue-500' },
  // the guests page includes an inline create form (POST ?/create), so link to it
  { title: 'Issue Guest Pass', description: 'Create a new guest pass', link: '/admin/dashboard/guests', iconPath: '/icons/issue-guest.svg', color: 'bg-green-500' },
    { title: 'Register Vehicle', description: 'Add a new vehicle', link: '/admin/dashboard/vehicles/create', iconPath: '/icons/register-vehicle.svg', color: 'bg-purple-500' },
    { title: 'View Reports', description: 'Access system reports', link: '/admin/dashboard/events', iconPath: '/icons/view-reports.svg', color: 'bg-orange-500' }
  ];

  // Total issued guest passes in the provided guestStats (last N days)
  const issuedCount = data?.guestStats ? data.guestStats.reduce((s, g) => s + (g.count || 0), 0) : 0;
  // initialize issued sparkline
  // We'll initialize both charts in the same onMount and clean both up in a single onDestroy
  onMount(() => {
    // main chart (Guests Issued over time)
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
    }

    // issued chart is created reactively below based on `selectedRange`.
  });

  onDestroy(() => {
    if (chart) chart.destroy();
    if (issuedChart) issuedChart.destroy();
  });

  // Re-create issuedChart whenever the selected range or data changes
  $: if (issuedCanvas && data?.guestStats) {
    const filtered = getFilteredStats(selectedRange);
    if (issuedChart) {
      issuedChart.destroy();
      issuedChart = null;
    }
    // graceful fallback when no data
    const labels = filtered.length ? filtered.map(g => g.date) : (data.guestStats || []).map(g => g.date).slice(-7);
    const values = filtered.length ? filtered.map(g => g.count) : (data.guestStats || []).map(g => g.count).slice(-7);

    issuedChart = new Chart(issuedCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Guests Issued',
          data: values,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.12)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#6366f1',
          pointRadius: 2,
          pointHoverRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { display: true, grid: { display: false }, ticks: { color: '#6b7280' } },
          y: { display: true, grid: { color: '#f3f4f6' }, ticks: { color: '#6b7280' }, beginAtZero: true }
        }
      }
    });
  }
</script>

<div class="max-w-7xl mx-auto px-4 lg:px-6">
  <!-- Compact Header -->
  <header class="flex items-center justify-between py-6 mb-6">
    <div class="flex items-center space-x-3">
      <div class="flex flex-col">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
        <div class="text-sm text-slate-500 dark:text-slate-400">{dateString}</div>
      </div>
    </div>
    <div class="flex items-center">
      <a href="/admin/dashboard/settings" class="group" aria-label="Account settings">
        <img 
          class="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg" 
          src={data.adminProfilePic ?? '/default-profile.png'} 
          alt="Profile" 
          width="48" 
          height="48" 
        />
      </a>
    </div>
  </header>

  <!-- Statistics Grid -->
  <section class="mb-8">
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {#each stats as stat}
        <a 
          href={stat.link} 
          class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md hover:scale-105 transition-all duration-200 text-center group"
        >
          <div class="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">{stat.icon}</div>
          <div class="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</div>
        </a>
      {/each}
    </div>
  </section>

  <!-- Issued Guest Passes Section -->
  <section class="mb-8">
    <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="text-sm font-medium text-slate-500 dark:text-slate-400">Issued Guest Passes</div>
          <div class="text-2xl font-bold text-slate-900 dark:text-white">{issuedCount}</div>
        </div>
        <div class="flex space-x-2">
          <button 
            class="px-3 py-1 text-sm font-medium rounded-lg transition-colors duration-200 {selectedRange === '7d' 
              ? 'bg-indigo-600 text-white' 
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'}"
            on:click={() => (selectedRange = '7d')}
          >
            7D
          </button>
          <button 
            class="px-3 py-1 text-sm font-medium rounded-lg transition-colors duration-200 {selectedRange === '1m' 
              ? 'bg-indigo-600 text-white' 
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'}"
            on:click={() => (selectedRange = '1m')}
          >
            1M
          </button>
          <button 
            class="px-3 py-1 text-sm font-medium rounded-lg transition-colors duration-200 {selectedRange === '3m' 
              ? 'bg-indigo-600 text-white' 
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'}"
            on:click={() => (selectedRange = '3m')}
          >
            3M
          </button>
        </div>
      </div>
      <div class="w-full h-36 mt-4">
        <canvas bind:this={issuedCanvas} class="w-full h-full block" aria-label="Issued guest passes chart"></canvas>
      </div>
    </div>
  </section>

  <!-- Quick Actions -->
  <section class="mt-8">
    <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-6">Quick Actions</h2>
    <!-- Mobile: 2x2 Grid (grid-cols-2), Desktop: 4 columns (lg:grid-cols-4) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {#each quickActions as action}
        <a 
          href={action.link} 
          class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:scale-105 transition-all duration-200 flex flex-col items-center text-center space-y-3"
        >
          <div class="w-12 h-12 rounded-lg {action.color} flex items-center justify-center">
            {#if action.iconSvg}
              {@html action.iconSvg}
            {:else if action.iconPath}
              <img src={action.iconPath} alt="" class="w-6 h-6 text-white" />
            {:else}
              <!-- fallback square -->
              {@html placeholderSvg()}
            {/if}
          </div>
          <div class="flex flex-col space-y-1">
            <h3 class="font-semibold text-sm text-slate-900 dark:text-white">{action.title}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-tight">{action.description}</p>
          </div>
        </a>
      {/each}
    </div>
  </section>
</div>

<style>
  /* Chart.js specific styles that need to stay */
  canvas {
    max-width: 100%;
    height: auto;
  }
</style>
