<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import Button from '$lib/ui/Button.svelte';

  const theme = writable<'light' | 'dark'>('light');

  function applyTheme(value: 'light' | 'dark') {
    if (typeof document === 'undefined') return;
    try { document.documentElement.dataset.theme = value; } catch (e) {}
  }

  function toggleTheme() {
    theme.update((t) => {
      const next = t === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('theme', next); } catch (e) {}
      applyTheme(next);
      return next;
    });
  }

  onMount(() => {
    try {
      const saved = (localStorage.getItem('theme') as 'light' | 'dark' | null) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      theme.set(saved);
      applyTheme(saved);
    } catch (e) {}
  });
</script>

<main class="p-8 font-sans">
  <h1 class="text-2xl font-bold mb-2">Theme test</h1>
  <p class="mb-4">Current data-theme: <strong>{typeof document !== 'undefined' ? document.documentElement.dataset.theme : 'ssr'}</strong></p>
  <Button on:click={toggleTheme} variant="outline">Toggle theme</Button>
</main>

