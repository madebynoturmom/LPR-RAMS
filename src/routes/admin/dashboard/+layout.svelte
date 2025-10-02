<script lang="ts">
  import { page } from '$app/stores';
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';

  const sidebarOpen = writable(false);

  interface NavLink { icon?: string; label: string; link: string; section?: string }

  // Navigation links for sidebar
  const navSections = [
    {
      title: 'Dashboard',
      links: [
        { icon: '/icons/house-icon.svg', label: 'Overview', link: '/admin/dashboard' },
        { icon: '', label: 'Analytics', link: '/admin/dashboard/analytics' }
      ]
    },
    {
      title: 'Management', 
      links: [
        { icon: '/icons/system-vehicles.svg', label: 'Vehicles', link: '/admin/dashboard/vehicles' },
        { icon: '', label: 'Licenses', link: '/admin/dashboard/licenses' },
        { icon: '', label: 'Reports', link: '/admin/dashboard/reports' }
      ]
    },
    {
      title: 'Users',
      links: [
        { icon: '', label: 'All Users', link: '/admin/dashboard/users' },
        { icon: '', label: 'Permissions', link: '/admin/dashboard/permissions' },
        { icon: '', label: 'Activity', link: '/admin/dashboard/activity' }
      ]
    },
    {
      title: 'Settings',
      links: [
        { icon: '', label: 'General', link: '/admin/dashboard/settings' },
        { icon: '', label: 'Notifications', link: '/admin/dashboard/notifications' },
        { icon: '', label: 'Profile', link: '/admin/dashboard/profile' }
      ]
    }
  ];

  // Separate bottom navigation links (original 3-button design)
  const bottomNavLinks = [
    { icon: '', label: 'Dashboard', link: '/admin/dashboard' },
    { icon: '', label: 'Manage', link: '/admin/dashboard/manage' },
    { icon: '', label: 'Settings', link: '/admin/dashboard/settings' }
  ];

  let userProfilePic = '/default-profile.png';
  let userName = 'Admin';
  let userRole = 'Administrator';

  // Load user data from page data
  $: userProfilePic = $page.data.user?.profilePic || '/default-profile.png';
  $: userName = $page.data.user?.name || 'Admin';
  $: userRole = $page.data.user?.role || 'Administrator';

  function toggleSidebar() {
    sidebarOpen.update(open => !open);
  }
</script>

<!-- Admin Layout with Responsive Sidebar -->
<div class="min-h-screen bg-slate-50 dark:bg-slate-900">
  <!-- Desktop Sidebar - Hidden on mobile, shown on desktop -->
  <aside class="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:dark:bg-slate-800 lg:shadow-lg">
    <!-- Sidebar Header -->
    <div class="flex items-center p-4 border-b border-slate-200 dark:border-slate-700">
      <div class="flex items-center space-x-3">
        <img src={userProfilePic} alt="Profile" class="w-8 h-8 rounded-full" />
        <div class="flex flex-col">
          <span class="text-sm font-semibold text-slate-900 dark:text-white">{userName}</span>
          <span class="text-xs text-slate-500 dark:text-slate-400">{userRole}</span>
        </div>
      </div>
    </div>

    <!-- Sidebar Navigation -->
    <nav class="p-4 space-y-6 flex-1 overflow-y-auto">
      {#each navSections as section}
        <div class="space-y-2">
          <!-- Section Header -->
          <h3 class="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {section.title}
          </h3>
          <!-- Section Links -->
          <div class="space-y-1">
            {#each section.links as nav}
              <a 
                href={nav.link} 
                class="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 {$page.url.pathname === nav.link 
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' 
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'}"
              >
                {#if nav.icon && nav.icon.includes('.')}
                  <img src={nav.icon} alt="" class="w-5 h-5" />
                {:else}
                  <span class="w-5 h-5 text-center text-base">{nav.icon}</span>
                {/if}
                <span>{nav.label}</span>
              </a>
            {/each}
          </div>
        </div>
      {/each}
    </nav>
  </aside>

  <!-- Main Content Area -->
  <div class="lg:ml-64">
    <!-- Main Content -->
    <main class="p-4 lg:p-6 pb-20 lg:pb-6"> <!-- Extra bottom padding for mobile nav -->
      <slot />
    </main>
  </div>

  <!-- Mobile Bottom Navigation - Original Design -->
  <div class="mobile-bottom-bar">
    <nav class="mobile-nav">
      {#each bottomNavLinks as nav}
        <a 
          href={nav.link} 
          class:active={$page.url.pathname === nav.link}
        >
          {#if nav.icon && nav.icon.includes('.')}
            <img src={nav.icon} alt="" class="m-icon-img" width="20" height="20" />
          {:else}
            <span class="m-icon">{nav.icon}</span>
          {/if}
          <span class="m-label">{nav.label}</span>
        </a>
      {/each}
    </nav>
  </div>
</div>

<svelte:head>
  <link rel="stylesheet" href="/admin/dashboard/subpage.css" />
</svelte:head>