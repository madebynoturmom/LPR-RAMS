<script lang="ts">
  // Use local Button primitive for stories to keep storybook lightweight
  import Button from '$lib/ui/Button.svelte';

  import { getContext } from 'svelte';
  interface Props {
    user?: { name: string };
    onLogin?: () => void;
    onLogout?: () => void;
    onCreateAccount?: () => void;
  }
  const { user, onLogin, onLogout, onCreateAccount }: Props = $props();

  // Provide default no-op functions to avoid undefined handlers
  const handleLogin = onLogin ?? (() => {});
  const handleLogout = onLogout ?? (() => {});
  const handleCreateAccount = onCreateAccount ?? (() => {});
</script>

<header class="border-b border-gray-200">
  <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
    <div class="flex items-center gap-3">
  <svg class="w-8 h-8" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g fill="none" fill-rule="evenodd">
          <path d="M10 0h12a10 10 0 0110 10v12a10 10 0 01-10 10H10A10 10 0 010 22V10A10 10 0 0110 0z" fill="#FFF" />
          <path d="M5.3 10.6l10.4 6v11.1l-10.4-6v-11zm11.4-6.2l9.7 5.5-9.7 5.6V4.4z" fill="#555AB9" />
          <path d="M27.2 10.6v11.2l-10.5 6V16.5l10.5-6zM15.7 4.4v11L6 10l9.7-5.5z" fill="#91BAF8" />
        </g>
      </svg>
      {#if user}
        <span class="mr-3 text-sm text-slate-700">Welcome, <b>{user.name}</b>!</span>
        <Button size="sm" variant="outline" on:click={handleLogout}>Log out</Button>
      {:else}
        <Button size="sm" variant="ghost" on:click={handleLogin}>Log in</Button>
        <Button size="sm" className="ml-2" on:click={handleCreateAccount}>Sign up</Button>
      {/if}
    </div>
  </div>
</header>
