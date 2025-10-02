<script lang="ts">
  import { page } from '$app/stores';
  import { writable } from 'svelte/store';

  const sidebarOpen = writable(false);

  function toggleSidebar() {
    sidebarOpen.update((value) => !value);
  }

  let navLinks = [
    { label: 'Dashboard', link: '/guard/dashboard' },
    { label: 'Settings', link: '/guard/dashboard/settings' }
  ];

  let userProfilePic: string | null = null;
  let userName = 'Guard';
  let userRole = 'Guard';
  $: userProfilePic = $page.data.user?.profilePic || null;
  $: userName = $page.data.user?.name || 'Guard';
  $: userRole = $page.data.user?.role || 'Guard';
  $: userInitials = (function() {
    const n = $page.data.user?.name || userName;
    const parts = String(n).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'G';
    if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
  })();
</script>

<div class="guard-layout" class:sidebar-open={$sidebarOpen}>
  <button class="top-toggle" on:click={toggleSidebar} aria-label="Open sidebar">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#232946" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  </button>
  <button
    type="button"
    class="sidebar-backdrop"
    class:visible={$sidebarOpen}
    on:click={toggleSidebar}
    aria-label="Close sidebar"
    tabindex="0"
    on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { toggleSidebar(); } }}
  ></button>
  <aside class="sidebar" class:open={$sidebarOpen} aria-label="Sidebar Navigation">
    <div class="sidebar-content">
      <div class="user-profile">
        {#if userProfilePic}
          <img src={userProfilePic} alt={userName} class="profile-pic" />
        {:else}
          <div class="profile-placeholder">{userInitials}</div>
        {/if}
        <div class="user-username">{userName}</div>
        <div class="user-role">{userRole}</div>
      </div>
      <nav class="sidebar-nav" aria-label="Main Navigation">
        {#each navLinks as nav}
          <a
            class="sidebar-link"
            href={nav.link}
            aria-current={$page.url.pathname === nav.link ? 'page' : undefined}
            class:active={$page.url.pathname === nav.link}
            on:click={() => { sidebarOpen.set(false); }}
          >{nav.label}</a>
        {/each}
      </nav>
      <div class="sidebar-bottom">
        <form class="logout-form-main" method="POST" action="/logout">
          <button class="logout-btn-main" type="submit">Logout</button>
        </form>
      </div>
    </div>
  </aside>
  <main class="dashboard-main">
    <slot />
  </main>
</div>

<style>
  .guard-layout { display:flex; flex-direction:row; min-height:100vh; width:100%; background:#f4f6fb; overflow-x:hidden; }
  .sidebar { width:280px; background:linear-gradient(180deg,#1e293b 0%,#0f172a 100%); color:#fff; display:flex; flex-direction:column; position:fixed; top:0; left:0; height:100vh; transform:translateX(-100%); transition:transform 0.3s cubic-bezier(.4,0,.2,1); box-shadow:4px 0 20px rgba(0,0,0,0.1); z-index:1000; }
  .sidebar.open { transform:translateX(0); }
  .sidebar-content { display:flex; flex-direction:column; height:100%; padding:2rem 1.5rem; }
  .sidebar-nav { flex:1 1 auto; display:flex; flex-direction:column; gap:0.5rem; margin-top:2rem; }
  .sidebar-link { display:block; color:#e2e8f0; text-decoration:none; padding:0.875rem 1rem; border-radius:8px; font-weight:500; transition:all 0.2s ease; }
  .sidebar-link:hover { background:rgba(99,102,241,0.1); color:#c7d2fe; }
  .sidebar-link.active { background:#6366f1; color:#fff; box-shadow:0 4px 12px rgba(99,102,241,0.3); }
  .top-toggle { position:fixed; top:1rem; left:1rem; z-index:1001; background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:0.75rem; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.1); transition:all 0.2s ease; display:none; }
  .sidebar-backdrop { position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.5); z-index:999; border:none; cursor:default; opacity:0; pointer-events:none; transition:opacity 0.3s ease; }
  .sidebar-backdrop.visible { opacity:1; pointer-events:auto; }
  .user-profile { display:flex; flex-direction:column; align-items:center; padding:1rem; background:rgba(255,255,255,0.05); border-radius:12px; margin-bottom:1rem; }
  .profile-pic { width:64px; height:64px; border-radius:50%; object-fit:cover; margin-bottom:0.75rem; background:#fff; border:3px solid #6366f1; box-shadow:0 4px 12px rgba(99,102,241,0.2); }
  .user-username { font-weight:600; font-size:1.1rem; margin-bottom:0.5rem; color:#f1f5f9; }
  .user-role { font-size:0.875rem; color:#94a3b8; background:rgba(148,163,184,0.1); padding:0.25rem 0.75rem; border-radius:20px; }
  .sidebar-bottom { margin-top:auto; width:100%; display:flex; flex-direction:column; gap:1rem; padding-top:2rem; }
  .logout-btn-main { width:100%; background:rgba(239,68,68,0.1); color:#fca5a5; border:1px solid rgba(239,68,68,0.2); padding:0.75rem 1rem; border-radius:8px; font-weight:500; cursor:pointer; }
  .logout-btn-main:hover { background:rgba(239,68,68,0.2); color:#fecaca; }
  .dashboard-main { flex:1 1 0%; min-width:0; min-height:0; overflow-y:auto; padding:0; background:#f8fafc; min-height:100vh; display:flex; flex-direction:column; align-items:flex-start; box-sizing:border-box; }
  /* Sidebar now overlays content; do not shift main layout when open */
  @media (max-width:900px) {
    .guard-layout { flex-direction:column; height:100vh; }
    .sidebar { position:fixed; top:0; left:0; height:100vh; transform:translateX(-100%); }
    .sidebar.open { transform:translateX(0); }
    .top-toggle { display:block; }
    .guard-layout.sidebar-open .top-toggle { display:none; }
    .dashboard-main { padding:0; min-height:0; overflow-y:auto; background:#f8fafc; margin-left:0; }
  }
</style>
