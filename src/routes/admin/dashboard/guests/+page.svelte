
<script lang="ts">
	import { onMount } from 'svelte';
	import ActionButton from '$lib/components/ActionButton.svelte';
	
	export let data: any;
	let passes: any[] = data?.passes ?? [];

	type Pass = { 
		id?: string; 
		plateNumber?: string; 
		name?: string; 
		phone?: string; 
		visitTime?: string; 
		durationMinutes?: number; 
		type?: string;
		status?: string;
		[k: string]: any 
	};
	
	let selectedPass: Pass | null = null;
	let error: string | null = null;
	let expandedId: string | null = null;
	let showToast = false;
	let toastProgress = 0;
	let extendingId: string | null = null;
	let extendMinutes: number = 30;
	let searchQuery = '';
	let filterType = 'all';

	// Filter passes
	$: filteredPasses = passes.filter((pass: any) => {
		const matchesSearch = searchQuery === '' || 
			pass.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			pass.plateNumber?.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesType = filterType === 'all' || pass.type === filterType;
		return matchesSearch && matchesType;
	});

	// Get pass status
	function getPassStatus(pass: Pass) {
		if (!pass.visitTime) return 'unknown';
		const visitDate = new Date(pass.visitTime);
		const expiryDate = new Date(visitDate.getTime() + (pass.durationMinutes || 0) * 60000);
		return expiryDate > new Date() ? 'active' : 'expired';
	}

	// Get remaining time
	function getRemainingTime(pass: Pass) {
		if (!pass.visitTime) return 'N/A';
		const visitDate = new Date(pass.visitTime);
		const expiryDate = new Date(visitDate.getTime() + (pass.durationMinutes || 0) * 60000);
		const now = new Date();
		const diffMs = expiryDate.getTime() - now.getTime();
		
		if (diffMs < 0) return 'Expired';
		
		const hours = Math.floor(diffMs / 3600000);
		const minutes = Math.floor((diffMs % 3600000) / 60000);
		
		if (hours > 0) return `${hours}h ${minutes}m left`;
		return `${minutes}m left`;
	}

	function toggleExpand(id: string) { expandedId = expandedId === id ? null : id; }

onMount(() => {
	try {
		const url = new URL(window.location.href);
		if (url.searchParams.get('deleted') === '1') {
			showDeleteToast();
			url.searchParams.delete('deleted');
			window.history.replaceState({}, '', url.pathname + url.search + url.hash);
		}
	} catch (e) {}
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

	function openEdit(pass: Pass) {
		selectedPass = { ...pass };
		error = null;
	}

	function formatDate(dt: string | undefined) {
		if (!dt) return '—';
		try {
			const d = new Date(dt);
			return d.toLocaleString();
		} catch (e) {
			return String(dt);
		}
	}

	async function submitExtend(pass: Pass) {
		try {
			const id = pass.id;
			const fd = new FormData();
			fd.append('id', String(id));
			fd.append('minutes', String(extendMinutes));
			const res = await fetch(`/admin/dashboard/guests/${id}/extend`, { method: 'POST', body: fd });
			if (!res.ok) {
				error = 'Failed to extend pass';
				return;
			}
			// try parse updated pass from response
			let updated: any = null;
			try { updated = await res.json(); } catch (e) {}
			const idx = passes.findIndex(p => String(p.id) === String(id));
			if (idx !== -1) {
				if (updated?.pass) passes[idx] = { ...passes[idx], ...updated.pass };
				else passes[idx].durationMinutes = (Number(passes[idx].durationMinutes) || 0) + Number(extendMinutes);
			}
			extendingId = null;
		} catch (e) {
			error = 'Failed to extend pass';
		}
	}

	function cancelEdit(): void {
		selectedPass = null;
		error = null;
	}

	async function submitEdit(e: Event) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const fd = new FormData(form);
		const id = selectedPass?.id;
		const res = await fetch(`/admin/dashboard/guests/${id}/edit`, { method: 'POST', body: fd });
		if (!res.ok) { error = 'Failed to update guest pass'; return; }
		const idx = passes.findIndex(p => String(p.id) === String(id));
		if (idx !== -1) passes[idx] = { ...passes[idx], ...Object.fromEntries(fd as any) };
		selectedPass = null;
	}
</script>
<svelte:head>
	<link rel="stylesheet" href="/admin/dashboard/subpage.css" />
	<link rel="stylesheet" href="/admin/dashboard/guests/guests.css" />
</svelte:head>

<div class="subpage-container">
	<div class="subpage-card">
		<div class="subpage-header">
			<div>
				<h2 class="subpage-title">Guest Passes</h2>
				<p class="text-gray-500 mt-2 text-sm">
					{filteredPasses.length} pass{filteredPasses.length !== 1 ? 'es' : ''} • {filteredPasses.filter(p => getPassStatus(p) === 'active').length} active
				</p>
			</div>
			<div class="subpage-actions">
				<ActionButton href="/admin/dashboard/guests/create" variant="primary" size="medium" icon="add">
					Issue Pass
				</ActionButton>
			</div>
		</div>

		<!-- Filters -->
		<div class="guests-filters">
			<div class="search-box">
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="11" cy="11" r="8"></circle>
					<path d="m21 21-4.35-4.35"></path>
				</svg>
				<input 
					type="search" 
					placeholder="Search by name or plate..." 
					bind:value={searchQuery}
					class="search-input"
				/>
			</div>
			
			<select bind:value={filterType} class="filter-select">
				<option value="all">All Types</option>
				<option value="guest">Guest Pass</option>
				<option value="food_delivery">Food Delivery</option>
			</select>
		</div>
		{#if selectedPass}
			<div class="edit-card">
				<div class="edit-card-header">
					<h3>Edit Guest Pass</h3>
					<button type="button" class="btn btn-ghost" on:click={cancelEdit}>✕</button>
				</div>
				<form class="edit-form subpage-form" on:submit={submitEdit}>
					<input type="hidden" name="id" value={selectedPass.id} />
					<label>
						Plate Number
						<input name="plateNumber" value={selectedPass.plateNumber} required />
					</label>
					<label>
						Name
						<input name="name" value={selectedPass.name} required />
					</label>
					<label>
						Phone
						<input name="phone" value={selectedPass.phone} required />
					</label>
					<label>
						Visit Time
						<input name="visitTime" type="datetime-local" value={selectedPass.visitTime} required />
					</label>
					<label>
						Duration (minutes)
						<input name="durationMinutes" type="number" value={selectedPass.durationMinutes} required />
					</label>
					<div class="flex gap-2 mt-3">
						<button type="submit" class="btn btn-update">Save Changes</button>
						<button type="button" class="btn btn-ghost" on:click={cancelEdit}>Cancel</button>
					</div>
					{#if error}<div class="error text-red-500 mt-2">{error}</div>{/if}
				</form>
			</div>
		{/if}

		{#if filteredPasses.length > 0}
			<div class="passes-list">
				{#each filteredPasses as pass (pass.id)}
					{@const status = getPassStatus(pass)}
					<div class="pass-card {status}">
						<div class="pass-header">
							<div class="pass-icon {pass.type === 'food_delivery' ? 'delivery' : 'guest'}">
								{#if pass.type === 'food_delivery'}
									🍕
								{:else}
									🎫
								{/if}
							</div>
							<div class="pass-main">
								<div class="pass-title">{pass.name || 'Guest'}</div>
								<div class="pass-plate">{pass.plateNumber || 'No plate'}</div>
							</div>
							<div class="pass-status-badge">
								<span class="status-dot {status}"></span>
								<span class="status-text">{status === 'active' ? 'Active' : 'Expired'}</span>
							</div>
						</div>

						<div class="pass-body">
							<div class="pass-info-grid">
								<div class="info-item">
									<div class="info-label">Phone</div>
									<div class="info-value">{pass.phone || '—'}</div>
								</div>
								<div class="info-item">
									<div class="info-label">Visit Time</div>
									<div class="info-value">{formatDate(pass.visitTime)}</div>
								</div>
								<div class="info-item">
									<div class="info-label">Duration</div>
									<div class="info-value">{pass.durationMinutes} min</div>
								</div>
								<div class="info-item">
									<div class="info-label">Time Left</div>
									<div class="info-value {status === 'expired' ? 'text-red-500' : 'text-green-600'}">
										{getRemainingTime(pass)}
									</div>
								</div>
							</div>
						</div>

						<div class="pass-actions">
							{#if extendingId === String(pass.id)}
								<div class="extend-controls">
									<input 
										type="number" 
										min="1" 
										bind:value={extendMinutes} 
										class="extend-input"
										placeholder="Minutes"
									/>
									<button type="button" class="action-btn extend" on:click={() => submitExtend(pass)}>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<polyline points="20 6 9 17 4 12"></polyline>
										</svg>
										Apply
									</button>
									<button type="button" class="action-btn cancel" on:click={() => { extendingId = null; }}>
										Cancel
									</button>
								</div>
							{:else}
								<button 
									type="button" 
									class="action-btn extend"
									on:click={() => { extendingId = String(pass.id); extendMinutes = 30; }}
									disabled={status === 'expired'}
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<circle cx="12" cy="12" r="10"></circle>
										<polyline points="12 6 12 12 16 14"></polyline>
									</svg>
									Extend
								</button>
								<button type="button" class="action-btn edit" on:click={() => openEdit(pass)}>
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
									</svg>
									Edit
								</button>
								<form method="POST" action="?/delete" class="inline">
									<input type="hidden" name="id" value={pass.id} />
									<button type="submit" class="action-btn delete">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<polyline points="3 6 5 6 21 6"></polyline>
											<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
										</svg>
										Delete
									</button>
								</form>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<div class="empty-icon">🎫</div>
				<p class="empty-text">No guest passes found</p>
				<p class="empty-subtext">Issue a new pass to get started</p>
			</div>
		{/if}
	</div>
</div>

{#if showToast}
  <div class="toast-wrap" role="status" aria-live="polite">
    <div class="toast">Guest pass deleted</div>
    <div class="toast-progress"><div class="toast-bar" style="width:{toastProgress}%"></div></div>
  </div>
{/if}