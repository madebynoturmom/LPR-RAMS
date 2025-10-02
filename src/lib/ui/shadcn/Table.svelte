<script lang="ts">
  export let columns: Array<{ key: string; label: string }> = [];
  export let rows: any[] = [];
</script>

<div class="overflow-auto bg-white rounded-lg shadow-sm">
  <table class="min-w-full divide-y">
    <thead class="bg-slate-50">
      <tr>
        {#each columns as col}
          <th class="px-4 py-2 text-left text-sm font-medium text-slate-600">{col.label}</th>
        {/each}
      </tr>
    </thead>
    <tbody class="divide-y">
      {#each rows as row}
        <tr class="hover:bg-slate-50">
          {#each columns as col}
            <td class="px-4 py-2 text-sm text-slate-700">{row[col.key]}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
