<script lang="ts">
  import ActionButton from '$lib/components/ActionButton.svelte';
  export let data: any;
  let residents: any[] = data?.residents ?? [];
  let error: string | null = null;
  let success: string | null = null;
  async function deleteResident(id: string) {
    if (confirm('Are you sure you want to delete this resident?')) {
      const res = await fetch(`/admin/dashboard/residents/${id}/delete`, { method: 'POST' });
      if (res.ok) {
        window.location.reload();
      } else {
        alert('Failed to delete resident.');
      }
    }
  }

  // single edit card state
  type Resident = {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    carNumber: string | null;
    houseAddress: string | null;
    [key: string]: any;
  };
  let selectedResident: Resident | null = null;

  // accordion state: which resident is expanded
  let expandedId: string | null = null;

  function toggleExpand(id: string) {
    expandedId = expandedId === id ? null : id;
  }

  // search state
  let q = '';
  $: filteredResidents = q
    ? residents.filter(r => {
        const s = (r.name ?? '') + ' ' + (r.email ?? '') + ' ' + (r.carNumber ?? '');
        return s.toLowerCase().includes(q.toLowerCase());
      })
    : residents;

  function clearSearch() {
    q = '';
  }

  function openEdit(resident: Resident) {
    selectedResident = { ...resident };
    error = null;
    success = null;
  }

  function cancelEdit() {
    selectedResident = null;
    error = null;
    success = null;
  }

  async function submitEdit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const id = selectedResident?.id;
    const res = await fetch(`/admin/dashboard/residents/${id}/edit`, { method: 'POST', body: fd });
    if (!res.ok) {
      error = 'Failed to update resident';
      return;
    }
    // update local array
    const idx = residents.findIndex(r => String(r.id) === String(id));
    if (idx !== -1) residents[idx] = { ...residents[idx], ...Object.fromEntries(fd as any) };
    success = 'Resident updated';
    selectedResident = null;
  }

  // toast state for create success
  import { onMount } from 'svelte';
  let showToast = false;
  let toastProgress = 0; // 0..100

  onMount(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('created') === '1') {
        showCreateToast();
        // remove the query param from the URL without reloading
        url.searchParams.delete('created');
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
      }
    } catch (e) {
      // noop
    }
  });

  function showCreateToast() {
    showToast = true;
    toastProgress = 0;
    const duration = 3000;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      toastProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      if (elapsed < duration) requestAnimationFrame(tick);
      else {
        // hide after a short delay to let progress reach 100
        setTimeout(() => (showToast = false), 120);
      }
    };
    requestAnimationFrame(tick);
  }
</script>

 

<svelte:head>
  <link rel="stylesheet" href="/admin/dashboard/subpage.css" />
  <link rel="stylesheet" href="/admin/dashboard/residents/residents.css" />
</svelte:head>

<div class="subpage-container">
  <div class="subpage-card">
    <div class="page-header">
      <div class="subpage-header">
        <div>
          <h2 class="subpage-title">Manage Residents</h2>
          <p class="text-gray-500 mt-2 text-sm">Manage resident information and access control</p>
        </div>
                <div class="subpage-actions">
          <ActionButton href="/admin/dashboard/residents/create" variant="primary" size="medium" icon="add">
            Add Resident
          </ActionButton>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-label">Total Residents</div>
          <div class="stat-value">{residents.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Search Results</div>
          <div class="stat-value">{filteredResidents.length}</div>
        </div>
      </div>

      <div class="search-box">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input 
          type="search" 
          placeholder="Search by name, email, or car number..." 
          bind:value={q}
        />
      </div>
    </div>
    {#if selectedResident}
      <div class="edit-card">
        <div class="edit-card-header">
          <h3>Edit Resident</h3>
          <button type="button" class="btn btn-ghost" on:click={cancelEdit}>✕</button>
        </div>
        <form class="edit-form subpage-form" on:submit={submitEdit}>
          <input type="hidden" name="id" value={selectedResident.id} />
          <label>
            Name
            <input name="name" value={selectedResident.name} required />
          </label>
          <label>
            Email
            <input name="email" type="email" value={selectedResident.email} required />
          </label>
          <label>
            Phone Number
            <input name="phone" value={selectedResident.phone} required />
          </label>
          <label>
            Car Number
            <input name="carNumber" value={selectedResident.carNumber} required />
          </label>
          <label>
            House Address
            <input name="houseAddress" value={selectedResident.houseAddress} required />
          </label>
          <div class="flex gap-2 mt-3">
            <button type="submit" class="btn btn-update">Save Changes</button>
            <button type="button" class="btn btn-ghost" on:click={cancelEdit}>Cancel</button>
          </div>
          {#if error}<div class="error text-red-500 mt-2">{error}</div>{/if}
          {#if success}<div class="success text-green-600 mt-2">{success}</div>{/if}
        </form>
      </div>
    {/if}

    {#if filteredResidents.length > 0}
      <div class="residents-list">
        {#each filteredResidents as resident (resident.id)}
          <div class="resident-card">
            <div class="resident-header">
              <div class="resident-avatar">
                {resident.name?.charAt(0).toUpperCase() || 'R'}
              </div>
              <div class="resident-main">
                <div class="resident-title">{resident.name || 'Unnamed'}</div>
                <div class="resident-address">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  {resident.houseAddress || 'No address'}
                </div>
              </div>
            </div>

            <div class="resident-body">
              <div class="resident-info-grid">
                <div class="info-item">
                  <div class="info-label">Email</div>
                  <div class="info-value">{resident.email || '—'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Phone</div>
                  <div class="info-value">{resident.phone || '—'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Vehicle</div>
                  <div class="info-value car-number">{resident.carNumber || 'No vehicle'}</div>
                </div>
              </div>
            </div>

            <div class="resident-actions">
              <button type="button" class="action-btn edit" on:click={() => openEdit(resident)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
                Edit
              </button>
              <form method="POST" class="inline" on:submit|preventDefault={() => deleteResident(resident.id)}>
                <button type="submit" class="action-btn delete">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Delete
                </button>
              </form>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="empty-state">
        <div class="empty-icon">👤</div>
        <p class="empty-text">No residents found</p>
        <p class="empty-subtext">Add a new resident to get started</p>
      </div>
    {/if}
  </div>
</div>

{#if showToast}
  <div class="toast-wrap" role="status" aria-live="polite">
    <div class="toast">Resident created successfully</div>
    <div class="toast-progress"><div class="toast-bar" style="width:{toastProgress}%"></div></div>
  </div>
{/if}
