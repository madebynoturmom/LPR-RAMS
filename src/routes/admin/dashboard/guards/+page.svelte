<script lang="ts">
  // exported page data
  export let data: any;
  // guards list comes from page data
  let guards: any[] = data?.guards ?? [];

  // In development, show sample rows when there are no real guards so the table layout can be previewed.
  const sampleGuards: Guard[] = [
    { id: 'g-1', name: 'Alice Smith', phone: '555-0101', guardId: 'G-001' },
    { id: 'g-2', name: 'Bob Johnson', phone: '555-0202', guardId: 'G-002' },
    { id: 'g-3', name: 'Carlos Ruiz', phone: '555-0303', guardId: 'G-003' }
  ];

  // Use real guards if present; otherwise, in dev show sample data. Production remains unchanged.
  const displayedGuards: Guard[] = (guards && guards.length > 0) ? guards : (import.meta.env.DEV ? sampleGuards : []);

  type Guard = { id?: string; name?: string | null; phone?: string | null; guardId?: string | null; [k: string]: any };
  let selectedGuard: Guard | null = null;
  let error: string | null = null;
  // accordion state: which guard row is expanded
  let expandedId: string | null = null;

  function toggleExpand(id?: string | number) {
    // guard.id may be undefined for sample or partial records; ignore if missing
    if (id == null) return;
    const sid = String(id);
    expandedId = expandedId === sid ? null : sid;
  }

  function openEdit(guard: Guard) {
    selectedGuard = { ...guard };
    error = null;
  }

  function cancelEdit(): void {
    selectedGuard = null;
    error = null;
  }

  import { onMount } from 'svelte';

  // toast state for delete success
  let showToast = false;
  let toastProgress = 0; // 0..100
  onMount(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('deleted') === '1') {
        showDeleteToast();
        url.searchParams.delete('deleted');
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
      }
    } catch (e) {
      // noop
    }
  });

  function showDeleteToast() {
    showToast = true;
    toastProgress = 0;
    const duration = 3000;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      toastProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      if (elapsed < duration) requestAnimationFrame(tick);
      else setTimeout(() => (showToast = false), 120);
    };
    requestAnimationFrame(tick);
  }

  async function submitEdit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const id = selectedGuard?.id;
    const res = await fetch(`/admin/dashboard/guards/${id}/edit`, { method: 'POST', body: fd });
    if (!res.ok) {
      error = 'Failed to update guard (server may need an edit endpoint)';
      return;
    }
    // optimistic local update
    const idx = guards.findIndex(g => String(g.id) === String(id));
    if (idx !== -1) {
      const entries = Array.from(fd.entries()).reduce((acc, [k, v]) => {
        // prefer string values for simple form fields
        (acc as any)[String(k)] = typeof v === 'string' ? v : v;
        return acc;
      }, {} as Record<string, any>);
      guards[idx] = { ...guards[idx], ...entries };
    }
    selectedGuard = null;
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="/admin/dashboard/subpage.css" />
  <link rel="stylesheet" href="/admin/dashboard/guards/guards.css" />
</svelte:head>

<div class="subpage-container">
  <div class="subpage-card">
    <div class="subpage-header">
      <div>
        <h2 class="subpage-title">Manage Guards</h2>
        <p class="text-gray-500 mt-2 text-sm">
          {displayedGuards.length} guard{displayedGuards.length !== 1 ? 's' : ''} on duty
        </p>
      </div>
      <div class="subpage-actions">
        <a href="/admin/dashboard/guards/create" class="add-guard-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Guard
        </a>
      </div>
    </div>

    {#if selectedGuard}
      <div class="edit-card">
        <div class="edit-card-header">
          <h3>Edit Guard</h3>
          <button type="button" class="btn btn-ghost" on:click={cancelEdit}>✕</button>
        </div>
        <form class="edit-form subpage-form" on:submit={submitEdit}>
          <input type="hidden" name="id" value={selectedGuard.id} />
          <label>
            Name
            <input name="name" value={selectedGuard.name} required placeholder="Enter guard name" />
          </label>
          <label>
            Phone
            <input name="phone" value={selectedGuard.phone} required placeholder="Enter phone number" />
          </label>
          <label>
            Guard ID
            <input name="guardId" value={selectedGuard.guardId} required placeholder="Enter guard ID" />
          </label>
          <div class="flex gap-2 mt-3">
            <button type="submit" class="btn btn-update">Save Changes</button>
            <button type="button" class="btn btn-ghost" on:click={cancelEdit}>Cancel</button>
          </div>
          {#if error}<div class="error">{error}</div>{/if}
        </form>
      </div>
    {/if}

    {#if displayedGuards.length > 0}
      <div class="resident-list">
        {#each displayedGuards as guard (guard.id)}
          <div class="resident-item {expandedId === String(guard.id) ? 'expanded' : ''}">
            <button 
              class="resident-summary" 
              on:click={() => toggleExpand(guard.id)} 
              aria-expanded={expandedId === String(guard.id)}
            >
              <div class="guard-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5Z"></path>
                  <path d="M20 21a8 8 0 0 0-16 0"></path>
                  <path d="m2 8 10-5 10 5-10 5Z"></path>
                  <path d="m4 10 8 4 8-4"></path>
                </svg>
              </div>
              <div class="guard-info">
                <div class="resident-name">{guard.name ?? 'N/A'}</div>
                <div class="resident-house">
                  <span class="guard-badge">#{guard.guardId ?? 'N/A'}</span>
                  <span class="guard-phone">{guard.phone ?? 'No phone'}</span>
                </div>
              </div>
              <div class="chev">{expandedId === String(guard.id) ? '▾' : '▸'}</div>
            </button>
            
            {#if expandedId === String(guard.id)}
              <div class="resident-details">
                <div class="detail-grid">
                  <div class="detail-item">
                    <div class="detail-label">Full Name</div>
                    <div class="detail-value">{guard.name ?? '—'}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Guard ID</div>
                    <div class="detail-value">
                      <span class="badge-id">{guard.guardId ?? '—'}</span>
                    </div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Phone Number</div>
                    <div class="detail-value">{guard.phone ?? '—'}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Status</div>
                    <div class="detail-value">
                      <span class="status-badge active">Active</span>
                    </div>
                  </div>
                </div>
                
                <div class="detail-actions">
                  <button type="button" class="edit-btn" on:click|stopPropagation={() => openEdit(guard)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                    Edit
                  </button>
                  <form method="POST" action="?/delete" class="inline">
                    <input type="hidden" name="id" value={guard.id} />
                    <button type="submit" class="delete-btn" on:click|stopPropagation>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <div class="empty-state">
        <div class="empty-icon">👮</div>
        <p class="empty-text">No guards found</p>
        <p class="empty-subtext">Add your first guard to get started</p>
      </div>
    {/if}
  </div>
</div>

{#if showToast}
  <div class="toast-wrap" role="status" aria-live="polite">
    <div class="toast">Guard deleted successfully</div>
    <div class="toast-progress"><div class="toast-bar" style="width:{toastProgress}%"></div></div>
  </div>
{/if}
