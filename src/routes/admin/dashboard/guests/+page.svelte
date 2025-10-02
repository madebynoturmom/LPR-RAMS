
<script lang="ts">
	export let data: any;
	let passes: any[] = data?.passes ?? [];

	type Pass = { id?: string; plateNumber?: string; name?: string; phone?: string; visitTime?: string; durationMinutes?: number; [k: string]: any };
	let selectedPass: Pass | null = null;
	let error: string | null = null;

// accordion + delete toast state
import { onMount } from 'svelte';
let expandedId: string | null = null;
let showToast = false;
let toastProgress = 0;
let extendingId: string | null = null;
let extendMinutes: number = 30;

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


 

<div class="subpage-container">
	<div class="subpage-card">
		<div class="subpage-header">
			<div>
				<h2 class="subpage-title">Manage Guest Passes</h2>
			</div>
		</div>

	<form method="POST" action="?/create" class="vehicle-form">
		<label>
			Plate Number:
			<input name="plateNumber" required />
		</label>
		<label>
			Name:
			<input name="name" required />
		</label>
		<label>
			Phone:
			<input name="phone" required />
		</label>
		<label>
			Visit Time:
			<input name="visitTime" type="datetime-local" required />
		</label>
		<label>
			Duration (minutes):
			<input name="durationMinutes" type="number" min="1" required />
		</label>
		<button type="submit" class="btn btn-update">Create Pass</button>
	</form>
	<h3>Active Guest Passes</h3>
	{#if selectedPass}
		<div class="edit-card">
			<form class="edit-form subpage-form" on:submit={submitEdit}>
				<input type="hidden" name="id" value={selectedPass.id} />
				<label>Plate Number<input name="plateNumber" value={selectedPass.plateNumber} required /></label>
				<label>Name<input name="name" value={selectedPass.name} required /></label>
				<label>Phone<input name="phone" value={selectedPass.phone} required /></label>
				<label>Visit Time<input name="visitTime" type="datetime-local" value={selectedPass.visitTime} required /></label>
				<label>Duration<input name="durationMinutes" type="number" value={selectedPass.durationMinutes} required /></label>
				<div style="display:flex; gap:0.5rem; margin-top:0.75rem;">
					<button type="submit" class="btn btn-update">Update</button>
					<button type="button" class="btn btn-ghost" on:click={cancelEdit}>Cancel</button>
				</div>
			</form>
		</div>
	{/if}
	{#if passes.length > 0}
		<div class="resident-list">
			{#each passes as pass}
				<div class="resident-item {expandedId === pass.id ? 'expanded' : ''}">
					<button class="resident-summary" on:click={() => toggleExpand(pass.id)}>
						<div class="resident-name">{pass.name}</div>
						<div class="resident-house">{pass.plateNumber}</div>
						<div class="chev">{expandedId === pass.id ? '▾' : '▸'}</div>
					</button>
					{#if expandedId === pass.id}
						<div class="resident-details">
							<div class="detail-row"><strong>Plate:</strong> {pass.plateNumber}</div>
							<div class="detail-row"><strong>Name:</strong> {pass.name}</div>
							<div class="detail-row"><strong>Phone:</strong> {pass.phone}</div>
							<div class="detail-row"><strong>Visit:</strong> {formatDate(pass.visitTime)}</div>
							<div class="detail-row"><strong>Duration:</strong> {pass.durationMinutes} minutes</div>
							<div class="detail-actions">
								{#if extendingId === String(pass.id)}
									<input class="extend-input" type="number" min="1" bind:value={extendMinutes} />
									<button type="button" class="edit-btn" on:click={() => submitExtend(pass)}>Apply</button>
									<button type="button" class="btn btn-ghost" on:click={() => { extendingId = null; }}>Cancel</button>
								{:else}
									<button type="button" class="edit-btn" on:click={() => { extendingId = String(pass.id); extendMinutes = 30; }}>Extend</button>
									<form method="POST" action="?/delete" style="display:inline">
										<input type="hidden" name="id" value={pass.id} />
										<button type="submit" class="delete-btn">Delete</button>
									</form>
								{/if}
							</div>
							
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<p>No guest passes found.</p>
	{/if}
	</div>
</div>

<!-- styles moved to subpage.css -->

{#if showToast}
  <div class="toast-wrap" role="status" aria-live="polite">
    <div class="toast">Guest pass deleted</div>
    <div class="toast-progress"><div class="toast-bar" style="width:{toastProgress}%"></div></div>
  </div>
{/if}