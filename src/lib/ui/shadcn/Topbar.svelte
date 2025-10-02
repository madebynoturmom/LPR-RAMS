<script lang="ts">
  export let onSearch: (q: string) => void = () => {};
  let query = '';
</script>

<header class="bg-white border-b">
  <div class="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
    <div class="flex-1">
      <input placeholder="Search..." bind:value={query} on:input={() => onSearch(query)} class="px-3 py-2 rounded-md border border-slate-200 w-full" />
    </div>
    <div>
      <slot name="actions" />
    </div>
  </div>
</header>
