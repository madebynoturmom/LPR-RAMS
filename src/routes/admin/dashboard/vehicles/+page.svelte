<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	let vehicles: any[] = data?.vehicles ?? [];
	let showToast = false;
	let toastProgress = 0;

	// Accordion state: which vehicle is expanded
	let expandedId: string | null = null;

	function toggleExpand(id: string) {
		expandedId = expandedId === id ? null : id;
	}

	// Search functionality
	let searchQuery = '';
	$: filteredVehicles = searchQuery
		? vehicles.filter(v => {
				const searchStr = (v.plateNumber ?? '') + ' ' + (v.ownerName ?? '') + ' ' + (v.model ?? '') + ' ' + (v.houseAddress ?? '');
				return searchStr.toLowerCase().includes(searchQuery.toLowerCase());
			})
		: vehicles;
</script>

<svelte:head>
	<link rel="stylesheet" href="/admin/dashboard/subpage.css" />
	<link rel="stylesheet" href="/admin/dashboard/vehicles/vehicles.css" />
</svelte:head>

<div class="subpage-container">
	<div class="subpage-card">
		<div class="page-header">
			<div class="subpage-header">
				<div>
					<h2 class="subpage-title">Vehicles</h2>
					<p class="text-gray-500 mt-2 text-sm">Manage registered vehicles and access control</p>
				</div>
				<div class="subpage-actions">
					<a class="add-vehicle-btn" href="/admin/dashboard/vehicles/create">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="12" y1="5" x2="12" y2="19"></line>
							<line x1="5" y1="12" x2="19" y2="12"></line>
						</svg>
						Add Vehicle
					</a>
				</div>
			</div>

			<div class="stats-row">
				<div class="stat-card">
					<div class="stat-label">Total Vehicles</div>
					<div class="stat-value">{vehicles.length}</div>
				</div>
				<div class="stat-card">
					<div class="stat-label">Search Results</div>
					<div class="stat-value">{filteredVehicles.length}</div>
				</div>
			</div>

			<div class="search-box">
				<svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="11" cy="11" r="8"></circle>
					<path d="m21 21-4.35-4.35"></path>
				</svg>
				<input 
					type="search" 
					placeholder="Search by plate number, owner, or model..." 
					bind:value={searchQuery}
				/>
			</div>
		</div>

		{#if filteredVehicles.length > 0}
			<div class="vehicles-list">
				{#each filteredVehicles as vehicle (vehicle.id)}
					<div class="vehicle-item {expandedId === vehicle.id ? 'expanded' : ''}">
						<button 
							class="vehicle-summary" 
							on:click={() => toggleExpand(vehicle.id)}
							aria-expanded={expandedId === vehicle.id}
						>
							<div class="vehicle-icon">
								🚗
							</div>
							<div class="vehicle-info">
								<div class="vehicle-plate">{vehicle.plateNumber || 'No plate'}</div>
								<div class="vehicle-address">
									<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
										<polyline points="9 22 9 12 15 12 15 22"></polyline>
									</svg>
									{vehicle.houseAddress || 'No address'}
								</div>
							</div>
							<div class="chev">{expandedId === vehicle.id ? '▾' : '▸'}</div>
						</button>

						{#if expandedId === vehicle.id}
							<div class="vehicle-details">
								<div class="detail-grid">
									<div class="detail-item">
										<div class="detail-label">Plate Number</div>
										<div class="detail-value">
											<span class="plate-badge">{vehicle.plateNumber || '—'}</span>
										</div>
									</div>
									<div class="detail-item">
										<div class="detail-label">Owner</div>
										<div class="detail-value">{vehicle.ownerName || '—'}</div>
									</div>
									<div class="detail-item">
										<div class="detail-label">House Address</div>
										<div class="detail-value">{vehicle.houseAddress || '—'}</div>
									</div>
									<div class="detail-item">
										<div class="detail-label">Model</div>
										<div class="detail-value">{vehicle.model || '—'}</div>
									</div>
									<div class="detail-item">
										<div class="detail-label">Year</div>
										<div class="detail-value">{vehicle.makeYear || '—'}</div>
									</div>
									{#if vehicle.color}
										<div class="detail-item">
											<div class="detail-label">Color</div>
											<div class="detail-value">{vehicle.color}</div>
										</div>
									{/if}
									{#if vehicle.createdAt}
										<div class="detail-item">
											<div class="detail-label">Registered</div>
											<div class="detail-value">{new Date(vehicle.createdAt).toLocaleDateString()}</div>
										</div>
									{/if}
									<div class="detail-item">
										<div class="detail-label">Status</div>
										<div class="detail-value">
											<span class="status-badge {vehicle.isActive ? 'active' : 'inactive'}">
												{vehicle.isActive ? 'Active' : 'Inactive'}
											</span>
										</div>
									</div>
								</div>

								<div class="detail-actions">
									<a class="action-btn edit" href={`/admin/dashboard/vehicles/${vehicle.id}/edit`}>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
										</svg>
										Edit
									</a>
									<form method="POST" action="?/delete" class="inline">
										<input type="hidden" name="id" value={vehicle.id} />
										<button type="submit" class="action-btn delete" on:click|stopPropagation>
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
				<div class="empty-icon">🚗</div>
				<p class="empty-text">No vehicles found</p>
				<p class="empty-subtext">Add a new vehicle to get started</p>
			</div>
		{/if}
	</div>

	{#if showToast}
		<div class="toast-wrap" role="status" aria-live="polite">
			<div class="toast">Vehicle deleted</div>
		</div>
	{/if}
</div>