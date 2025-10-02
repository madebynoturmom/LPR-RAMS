<script lang="ts">
  export let open = false;
  export let title: string | null = null;
  function close() {
    open = false;
  }
</script>

{#if open}
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow p-6 w-full max-w-2xl">
      {#if title}
        <h3 class="text-lg font-semibold mb-3">{title}</h3>
      {/if}
      <div>
        <slot />
      </div>
      <div class="mt-4 text-right">
        <button class="px-3 py-2 bg-slate-100 rounded" on:click={close}>Close</button>
      </div>
    </div>
  </div>
{/if}
