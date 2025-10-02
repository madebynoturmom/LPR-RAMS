<script lang="ts">
  import { page } from '$app/stores';
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';

  const sidebarOpen = writable(false);

  interface NavLink { iconPath?: string; icon?: string; label: string; link: string }

  // Use iconPath to reference static SVGs in /static/icons/
  let navLinks: NavLink[] = [
    { iconPath: '/icons/house-icon.svg', label: 'Dashboard', link: '/user/dashboard' },
    { iconPath: '/icons/users-icon.svg', label: 'Manage', link: '/user/dashboard/manage' },
    { iconPath: '/icons/bolt-icon.svg', label: 'Settings', link: '/user/dashboard/profile' }
  ];

  let userProfilePic = '/default-profile.png';
  let userName = 'Resident';
  let userRole = 'Resident';

  // Load user data from page data
  $: userProfilePic = $page.data.user?.profilePic || '/default-profile.png';
  $: userName = $page.data.user?.name || 'Resident';
  $: userRole = $page.data.user?.role || 'Resident';

  // User layout uses the light theme by default (no runtime theme toggle)
</script>

<div class="user-layout" class:sidebar-open={$sidebarOpen}>
  <!-- Top header with user info and logout -->
  <header class="dashboard-header">
    <div class="header-content">
      <div class="user-info">
        <img src={userProfilePic} alt="{userName}" class="user-avatar" />
        <div class="user-details">
          <span class="user-name">{userName}</span>
          <span class="user-role-badge">{userRole}</span>
        </div>
      </div>
      <a href="/logout" class="logout-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span>Logout</span>
      </a>
    </div>
  </header>
  
  <!-- Left sidebar removed; bottom bar is the primary navigation now -->
  <main class="dashboard-main">
    <div class="dashboard-inner">
      <slot />
    </div>
  </main>
  <!-- Mobile bottom navigation (rendered for small screens via CSS) -->
  <div class="mobile-bottom-bar" aria-hidden="false">
    <nav class="mobile-nav" aria-label="Mobile Navigation">
      {#each navLinks as nav}
        <a href={nav.link} class:active={$page.url.pathname === nav.link}>
          {#if nav.iconPath}
            <img src={nav.iconPath} alt="" class="m-icon-img" width="20" height="20" />
          {:else}
            <span class="m-icon">{nav.icon}</span>
          {/if}
          <span class="m-label">{nav.label}</span>
        </a>
      {/each}
      <!-- Logout button in mobile nav -->
      <a href="/logout" class="logout-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="m-icon-img">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span class="m-label">Logout</span>
      </a>
    </nav>
  </div>
</div>

<svelte:head>
  <link rel="stylesheet" href="/user/dashboard/subpage.css" />
</svelte:head>

<style>
  /* User layout styles - simplified to work with admin subpage.css */
  .user-layout {
    display: block;
    min-height: auto;
  }

  /* Dashboard header */
  .dashboard-header {
    background: var(--card-bg, #ffffff);
    border-bottom: 1px solid #e6eef8;
    padding: 1rem clamp(0.5rem, 3vw, 1.5rem);
    position: sticky;
    top: 0;
    z-index: 999;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e6eef8;
  }

  .user-details {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .user-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text, #1f2937);
  }

  .user-role-badge {
    font-size: 0.75rem;
    color: var(--muted, #6b7280);
    text-transform: capitalize;
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid #e6eef8;
    border-radius: 8px;
    color: var(--text, #1f2937);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .logout-btn:hover {
    background: #fee;
    border-color: #ef4444;
    color: #ef4444;
  }

  .logout-btn svg {
    transition: transform 0.2s ease;
  }

  .logout-btn:hover svg {
    transform: translateX(2px);
  }

  /* Hide logout button text on very small screens */
  @media (max-width: 480px) {
    .logout-btn span {
      display: none;
    }
    
    .logout-btn {
      padding: 0.5rem;
    }
  }

  .dashboard-main {
    width: 100%;
    box-sizing: border-box;
    padding: clamp(0.5rem, 3vw, 1.5rem);
    max-width: 1400px;
    margin: 0 auto;
  }

  .dashboard-inner {
    max-width: clamp(680px, 60vw, 1080px);
    margin: 0 auto;
    box-sizing: border-box;
  }

  /* Mobile bottom navigation bar */
  .mobile-bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--card-bg, #ffffff);
    border-top: 1px solid #e6eef8;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  .mobile-nav {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    padding: 0.75rem 1rem;
    max-width: 100%;
    margin: 0 auto;
    gap: 2rem;
  }

  .mobile-nav a {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: var(--muted, #6b7280);
    font-size: 12px;
    font-weight: 500;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
    min-width: 60px;
    position: relative;
  }

  .mobile-nav a:hover {
    background: rgba(99, 102, 241, 0.05);
    color: var(--accent, #6366f1);
  }

  .mobile-nav a.active {
    color: var(--accent, #6366f1);
    background: rgba(99, 102, 241, 0.1);
  }

  .mobile-nav a.active::after {
    content: '';
    position: absolute;
    top: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 2px;
    background: var(--accent, #6366f1);
    border-radius: 1px;
  }

  .m-icon-img {
    width: 20px;
    height: 20px;
    margin-bottom: 2px;
    filter: grayscale(100%);
    transition: filter 0.2s ease;
  }

  .mobile-nav a.active .m-icon-img,
  .mobile-nav a:hover .m-icon-img {
    filter: none;
  }

  .m-label {
    font-size: 11px;
    line-height: 1;
    text-align: center;
  }

  /* Logout link in mobile nav */
  .mobile-nav .logout-link {
    color: #ef4444;
  }

  .mobile-nav .logout-link:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
  }

  .mobile-nav .logout-link .m-icon-img {
    filter: none;
    stroke: currentColor;
  }

  /* Hide bottom bar on larger screens */
  @media (min-width: 768px) {
    .mobile-bottom-bar {
      display: none;
    }
  }
</style>
