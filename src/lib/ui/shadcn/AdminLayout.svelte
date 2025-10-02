<script lang="ts">
  export let title: string | null = null;
</script>

<div class="min-h-screen flex bg-slate-50">
  <slot name="sidebar" />
  <div class="flex-1">
    <slot name="topbar" />
    <main class="p-6">
      {#if title}
        <h1 class="text-2xl font-semibold mb-4">{title}</h1>
      {/if}
      <slot />
    </main>
  </div>
</div>
