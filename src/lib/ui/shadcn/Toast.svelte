<script lang="ts">
  export let message: string | null = null;
</script>

{#if message}
  <div class="fixed right-4 bottom-4 bg-slate-900 text-white px-4 py-2 rounded shadow">
    {message}
  </div>
{/if}
