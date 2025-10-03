
<script lang="ts">
	import type { Admin } from '$lib/server/db/schema';
	import ActionButton from '$lib/components/ActionButton.svelte';
	export let data;
	let admins: Admin[] = data?.admins ?? [];
	let error: string | null = null;
	let creating = false;
	let username = '';
	let password = '';

	// Mobile-friendly single edit card
	let selectedAdmin: Partial<Admin> | null = null;

	function openEdit(admin: Admin) {
		selectedAdmin = { ...admin };
		error = null;
	}

	function cancelEdit() {
		selectedAdmin = null;
		error = null;
	}

	import { onMount } from 'svelte';
	let expandedId: string | number | null = null;
	let showToast = false;
	let toastProgress = 0;

	function toggleExpand(id: string | number) { expandedId = expandedId === id ? null : id; }

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

	let uploading = false;
	let uploadedImageUrl = '';

	async function handleFileUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			error = 'Please select an image file';
			return;
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			error = 'Image size must be less than 5MB';
			return;
		}

		uploading = true;
		error = null;

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('prefix', 'admin');

			const res = await fetch('/api/upload', { method: 'POST', body: formData });
			if (!res.ok) {
				throw new Error('Upload failed');
			}

			const data = await res.json();
			uploadedImageUrl = data.url;
			if (selectedAdmin) {
				selectedAdmin.profilePic = data.url;
			}
		} catch (e) {
			error = 'Failed to upload image';
		} finally {
			uploading = false;
		}
	}

	async function submitEdit(e: Event) {
		e.preventDefault();
		error = null;
		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);
		const res = await fetch('?/' + 'updateAdmin', { method: 'POST', body: formData });
		if (!res.ok) {
			error = 'Failed to update admin';
			return;
		}
		// update local list for immediacy
		const id = formData.get('id') as string;
		const idx = admins.findIndex((a: Admin) => String(a.id) === String(id));
		if (idx !== -1) {
			admins[idx] = {
				...admins[idx],
				username: formData.get('username') as string,
				name: formData.get('name') as string,
				email: formData.get('email') as string,
				phone: formData.get('phone') as string,
				profilePic: formData.get('profilePic') as string
			};
		}
		selectedAdmin = null;
		uploadedImageUrl = '';
	}
</script>

<svelte:head>
	<link rel="stylesheet" href="/admin/dashboard/subpage.css" />
	<link rel="stylesheet" href="/admin/dashboard/admins/admins.css" />
</svelte:head>

<div class="subpage-container">
	<div class="subpage-card">
		{#if showToast}
		  <div class="toast-wrap" role="status" aria-live="polite">
		    <div class="toast">Admin deleted</div>
		    <div class="toast-progress"><div class="toast-bar" style="width:{toastProgress}%"></div></div>
		  </div>
		{/if}
		<div class="subpage-header">
			<div>
				<h2 class="subpage-title">Manage Admins</h2>
			</div>
			<div class="subpage-actions">
				<ActionButton href="/admin/dashboard/admins/create" variant="primary" size="medium" icon="add">
					Add Admin
				</ActionButton>
			</div>
		</div>
	{#if error}
		<div class="error">{error}</div>
	{/if}
		
		<div class="admin-list-card">
			{#if selectedAdmin}
				<div class="edit-card">
					<div class="edit-card-header">
						<h3>Edit Admin</h3>
						<button type="button" class="btn btn-ghost" on:click={cancelEdit}>✕</button>
					</div>
					<form class="edit-form subpage-form" on:submit={submitEdit}>
						<input type="hidden" name="id" value={selectedAdmin.id} />
						<div class="form-grid">
							<label for="username">
								Username
								<input id="username" name="username" type="text" bind:value={selectedAdmin.username} required />
							</label>
							<label for="name">
								Full Name
								<input id="name" name="name" type="text" bind:value={selectedAdmin.name} />
							</label>
							<label for="email">
								Email
								<input id="email" name="email" type="email" bind:value={selectedAdmin.email} />
							</label>
							<label for="phone">
								Phone
								<input id="phone" name="phone" type="tel" bind:value={selectedAdmin.phone} />
							</label>
						</div>
						
						<div class="profile-upload-section">
							<label class="upload-label">
								<span class="label-text">Profile Picture</span>
								<div class="upload-simple">
									<input 
										type="file" 
										accept="image/*" 
										class="file-input-simple" 
										on:change={handleFileUpload}
										disabled={uploading}
									/>
									{#if uploading}
										<div class="upload-status uploading">
											<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinning">
												<line x1="12" y1="2" x2="12" y2="6"></line>
												<line x1="12" y1="18" x2="12" y2="22"></line>
												<line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
												<line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
												<line x1="2" y1="12" x2="6" y2="12"></line>
												<line x1="18" y1="12" x2="22" y2="12"></line>
												<line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
												<line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
											</svg>
											<span>Uploading image...</span>
										</div>
									{:else if selectedAdmin.profilePic}
										<div class="upload-status success">
											<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
												<polyline points="20 6 9 17 4 12"></polyline>
											</svg>
											<span>Image uploaded successfully</span>
											<button type="button" class="remove-btn" on:click={() => { if (selectedAdmin) selectedAdmin.profilePic = ''; }}>
												Remove
											</button>
										</div>
									{/if}
								</div>
							</label>
							<input type="hidden" name="profilePic" bind:value={selectedAdmin.profilePic} />
						</div>

						<div class="form-actions">
							<button type="submit" class="btn-save" disabled={uploading}>
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="20 6 9 17 4 12"></polyline>
								</svg>
								Save Changes
							</button>
							<button type="button" class="btn-cancel" on:click={cancelEdit}>
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<line x1="18" y1="6" x2="6" y2="18"></line>
									<line x1="6" y1="6" x2="18" y2="18"></line>
								</svg>
								Cancel
							</button>
						</div>
						{#if error}<div class="error text-red-500 mt-2">{error}</div>{/if}
					</form>
				</div>
			{/if}
			<div class="admin-list">
				{#each admins as admin}
					<div class="admin-item {expandedId === admin.id ? 'expanded' : ''}">
						<button 
							class="admin-summary" 
							on:click={() => toggleExpand(admin.id)}
							aria-expanded={expandedId === admin.id}
						>
							<div class="admin-avatar">
								{#if admin.profilePic}
									<img src={admin.profilePic} alt={admin.name || admin.username} class="avatar-img" />
								{:else}
									<div class="avatar-placeholder">
										{(admin.name || admin.username).charAt(0).toUpperCase()}
									</div>
								{/if}
							</div>
							<div class="admin-info">
								<div class="admin-name">{admin.name || admin.username}</div>
								<div class="admin-email">{admin.email || 'No email'}</div>
							</div>
							<div class="chev">{expandedId === admin.id ? '▾' : '▸'}</div>
						</button>
						{#if expandedId === admin.id}
							<div class="admin-details">
								<div class="profile-section">
									<div class="profile-avatar-large">
										{#if admin.profilePic}
											<img src={admin.profilePic} alt={admin.name || admin.username} class="avatar-img-large" />
										{:else}
											<div class="avatar-placeholder-large">
												{(admin.name || admin.username).charAt(0).toUpperCase()}
											</div>
										{/if}
									</div>
									<div class="profile-info">
										<h4 class="profile-name">{admin.name || admin.username}</h4>
										<span class="role-badge">Administrator</span>
									</div>
								</div>
								<div class="detail-grid">
									<div class="detail-item">
										<div class="detail-label">
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
												<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
												<circle cx="12" cy="7" r="4"></circle>
											</svg>
											Username
										</div>
										<div class="detail-value">{admin.username}</div>
									</div>
									<div class="detail-item">
										<div class="detail-label">
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
												<rect width="20" height="16" x="2" y="4" rx="2"></rect>
												<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
											</svg>
											Email
										</div>
										<div class="detail-value">{admin.email || 'Not provided'}</div>
									</div>
									<div class="detail-item">
										<div class="detail-label">
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
												<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
											</svg>
											Phone
										</div>
										<div class="detail-value">{admin.phone || 'Not provided'}</div>
									</div>
									<div class="detail-item">
										<div class="detail-label">
											<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
												<path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path>
												<circle cx="12" cy="10" r="3"></circle>
											</svg>
											Full Name
										</div>
										<div class="detail-value">{admin.name || 'Not provided'}</div>
									</div>
								</div>
								<div class="detail-actions">
									<button type="button" class="action-btn edit" on:click|stopPropagation={() => openEdit(admin)}>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
										</svg>
										Edit
									</button>
									<form method="POST" action="?/deleteAdmin" class="inline">
										<input type="hidden" name="id" value={admin.id} />
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
		</div>
		</div>
	</div>
