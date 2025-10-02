<script lang="ts">
  export let items: Array<{ id: string; label: string; href?: string; icon?: any; badge?: string }> = [];
  export let activeId: string | null = null;
</script>

<nav class="w-64 bg-white border-r hidden md:block" aria-label="Sidebar">
  <div class="p-4">
    <slot name="brand" />
  </div>
  <ul class="px-2">
    {#each items as item}
      <li class="mb-1">
        <a href={item.href} class="flex items-center gap-3 px-3 py-2 rounded-md {item.id === activeId ? 'bg-sky-50 text-sky-600' : 'text-slate-700 hover:bg-slate-50'}">
          {#if item.icon}
            <span aria-hidden>{@html item.icon}</span>
          {/if}
          <span>{item.label}</span>
          {#if item.badge}
            <span class="ml-auto text-xs bg-slate-100 px-2 py-0.5 rounded">{item.badge}</span>
          {/if}
        </a>
      </li>
    {/each}
  </ul>
</nav>
