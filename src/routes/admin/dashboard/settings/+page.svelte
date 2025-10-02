<script lang="ts">
  import { page } from '$app/stores';

  // keep a small reactive reference for user data if subpages need it
  $: user = $page.data?.user;

  // lightweight placeholder file handler in case subpages import this component state
  let profilePic = '';
  let showLogout = false;
  async function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      profilePic = URL.createObjectURL(file);
    }
  }
</script>

<div class="dashboard-container">
  <header class="dashboard-overview">
    <div class="overview-left">
      <div class="overview-text">
        <h1 class="overview-title">Settings</h1>
        <div class="overview-date">Application settings & preferences</div>
      </div>
    </div>
  </header>

  <section class="settings-section">
    <div class="subpage-card">
      <div style="margin-top:1rem; max-width:720px;">
        <nav style="display:flex; flex-direction:column; gap:0.5rem;">
          <a href="/admin/dashboard/settings/account" class="settings-list-item">Account <span class="item-arrow">›</span></a>
          <a href="/admin/dashboard/settings/notifications" class="settings-list-item">Notifications <span class="item-arrow">›</span></a>
          <a href="/admin/dashboard/settings/appearance" class="settings-list-item">Appearance <span class="item-arrow">›</span></a>
          <a href="/admin/dashboard/settings/privacy" class="settings-list-item">Privacy &amp; Security <span class="item-arrow">›</span></a>
          <a href="/admin/dashboard/settings/help" class="settings-list-item">Help and Support <span class="item-arrow">›</span></a>
          <a href="/admin/dashboard/settings/about" class="settings-list-item">About <span class="item-arrow">›</span></a>
          <!-- Logout option -->
          <button class="settings-list-item logout-trigger" on:click={() => showLogout = true} aria-haspopup="dialog">Logout <span class="item-arrow">›</span></button>
        </nav>
      </div>
    </div>
  </section>

  {#if showLogout}
    <div class="modal-backdrop" role="dialog" aria-modal="true">
      <div class="modal-card">
        <h2>Are you sure you want to logout?</h2>
        <p>This will end your session and require you to sign in again.</p>
        <div class="modal-actions">
          <form method="POST" action="/logout">
            <button type="submit" class="btn btn-danger">Yes, logout</button>
          </form>
          <button class="btn btn-ghost" on:click={() => showLogout = false}>No, keep me signed in</button>
        </div>
      </div>
    </div>
  {/if}
</div>
<style>
  .settings-section { margin-top: 1rem; }
  /* reuse existing subpage/card classes where possible */
  .logout-trigger { text-align:left; background:none; border:none; padding:0.5rem 0; font:inherit; cursor:pointer; color:inherit; }
  .modal-backdrop { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.4); z-index:50; }
  .modal-card { background:var(--card-bg, #fff); padding:1.25rem; border-radius:8px; max-width:520px; width:90%; box-shadow:0 6px 18px rgba(0,0,0,0.12); }
  .modal-actions { display:flex; gap:0.75rem; justify-content:flex-end; margin-top:1rem; }
  .btn { padding:0.5rem 0.75rem; border-radius:6px; }
  .btn-danger { background:#ef4444; color:white; border:none; }
  .btn-ghost { background:transparent; border:1px solid rgba(0,0,0,0.08); }
</style>

