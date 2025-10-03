<script lang="ts">
	export let href: string;
	export let variant: 'primary' | 'secondary' | 'success' | 'danger' = 'primary';
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let icon: 'add' | 'edit' | 'delete' | 'view' | 'download' | 'upload' | 'none' = 'none';
</script>

<a {href} class="action-btn action-btn-{variant} action-btn-{size}">
	{#if icon === 'add'}
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<line x1="12" y1="5" x2="12" y2="19"></line>
			<line x1="5" y1="12" x2="19" y2="12"></line>
		</svg>
	{:else if icon === 'edit'}
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
		</svg>
	{:else if icon === 'delete'}
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<polyline points="3 6 5 6 21 6"></polyline>
			<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
		</svg>
	{:else if icon === 'view'}
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
			<circle cx="12" cy="12" r="3"></circle>
		</svg>
	{:else if icon === 'download'}
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
			<polyline points="7 10 12 15 17 10"></polyline>
			<line x1="12" y1="15" x2="12" y2="3"></line>
		</svg>
	{:else if icon === 'upload'}
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
			<polyline points="17 8 12 3 7 8"></polyline>
			<line x1="12" y1="3" x2="12" y2="15"></line>
		</svg>
	{/if}
	<slot />
</a>

<style>
	.action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: clamp(0.375rem, 1vw, 0.5rem);
		font-weight: 700;
		text-decoration: none;
		border-radius: clamp(0.5rem, 1.5vw, 0.625rem);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border: none;
		cursor: pointer;
		white-space: nowrap;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.action-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
	}

	.action-btn:active {
		transform: translateY(0);
	}

	.action-btn svg {
		flex-shrink: 0;
	}

	/* Sizes */
	.action-btn-small {
		padding: clamp(0.375rem, 1vw, 0.5rem) clamp(0.75rem, 1.75vw, 1rem);
		font-size: clamp(0.8rem, 1.75vw, 0.9rem);
	}

	.action-btn-small svg {
		width: 14px;
		height: 14px;
	}

	.action-btn-medium {
		padding: clamp(0.625rem, 1.75vw, 0.75rem) clamp(1.25rem, 2.5vw, 1.5rem);
		font-size: clamp(0.9rem, 2vw, 1rem);
	}

	.action-btn-large {
		padding: clamp(0.75rem, 2vw, 0.875rem) clamp(1.5rem, 3vw, 2rem);
		font-size: clamp(1rem, 2.25vw, 1.1rem);
	}

	.action-btn-large svg {
		width: 20px;
		height: 20px;
	}

	/* Variants */
	.action-btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.action-btn-primary:hover {
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
	}

	.action-btn-secondary {
		background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
		color: white;
	}

	.action-btn-secondary:hover {
		box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);
	}

	.action-btn-success {
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		color: white;
	}

	.action-btn-success:hover {
		box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
	}

	.action-btn-danger {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		color: white;
	}

	.action-btn-danger:hover {
		box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
	}

	/* Responsive */
	@media (max-width: 480px) {
		.action-btn {
			width: 100%;
		}
	}
</style>
