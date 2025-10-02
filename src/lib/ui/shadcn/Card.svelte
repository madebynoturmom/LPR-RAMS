<script lang="ts">
  export let title: string | null = null;
  export let footer: any = null;
</script>

<section class="bg-white rounded-lg shadow-sm p-4">
  {#if title}
    <div class="mb-3 flex items-center justify-between">
      <h3 class="text-lg font-medium">{title}</h3>
      <slot name="actions" />
    </div>
  {/if}

  <div>
    <slot />
  </div>

  {#if footer}
    <footer class="mt-4 text-sm text-slate-500">{footer}</footer>
  {/if}
</section>
