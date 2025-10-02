<script lang="ts">
  export let data: any;

  let visitors = data?.activeVisitorPasses ?? [];
  let food = data?.activeFoodDeliveryPasses ?? [];
  let recent = data?.recentCarAccess ?? [];

  let query = '';

  $: filteredVisitors = visitors.filter((p: any) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return String(p.plateNumber).toLowerCase().includes(q) || String(p.name).toLowerCase().includes(q);
  });
  $: filteredFood = food.filter((p: any) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return String(p.plateNumber).toLowerCase().includes(q) || String(p.name).toLowerCase().includes(q);
  });

  function fmt(dt: string) {
    try { return new Date(dt).toLocaleString(); } catch(e){ return dt; }
  }
</script>

<div class="guard-dashboard">
  <header class="gd-header">
    <h1>Guard Dashboard</h1>
    <div class="gd-controls">
      <input placeholder="Search plate or name" bind:value={query} />
    </div>
  </header>

  <section class="gd-stats">
    <div class="stat">Active Visitors: {visitors.length}</div>
    <div class="stat">Active Deliveries: {food.length}</div>
  </section>

  <section class="gd-lists">
    <div class="list-card">
      <h2>Visitors</h2>
      {#if filteredVisitors.length > 0}
        <table>
          <thead><tr><th>Plate</th><th>Name</th><th>Visit</th><th>Duration</th><th>Actions</th></tr></thead>
          <tbody>
            {#each filteredVisitors as p}
              <tr>
                <td>{p.plateNumber}</td>
                <td>{p.name}</td>
                <td>{fmt(p.visitTime)}</td>
                <td>{p.durationMinutes}m</td>
                <td>
                  <form method="POST" action="?/admit" style="display:inline">
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" class="btn-admit">Admit</button>
                  </form>
                  <form method="POST" action="?/deny" style="display:inline; margin-left:0.5rem;">
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" class="btn-deny">Deny</button>
                  </form>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No active visitor passes.</p>
      {/if}
    </div>

    <div class="list-card">
      <h2>Food Deliveries</h2>
      {#if filteredFood.length > 0}
        <table>
          <thead><tr><th>Plate</th><th>Name</th><th>Visit</th><th>Duration</th><th>Actions</th></tr></thead>
          <tbody>
            {#each filteredFood as p}
              <tr>
                <td>{p.plateNumber}</td>
                <td>{p.name}</td>
                <td>{fmt(p.visitTime)}</td>
                <td>{p.durationMinutes}m</td>
                <td>
                  <form method="POST" action="?/admit" style="display:inline">
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" class="btn-admit">Admit</button>
                  </form>
                  <form method="POST" action="?/deny" style="display:inline; margin-left:0.5rem;">
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" class="btn-deny">Deny</button>
                  </form>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No active food delivery passes.</p>
      {/if}
    </div>
  </section>

  <section class="gd-events">
    <h2>Recent Events</h2>
    {#if recent.length > 0}
      <ul>
        {#each recent as r}
          <li>{new Date(r.timestamp).toLocaleString()} — {r.details}</li>
        {/each}
      </ul>
    {:else}
      <p>No recent events.</p>
    {/if}
  </section>
</div>

<style>
  .guard-dashboard { padding: 1rem; max-width: 1100px; margin: 0 auto; }
  .gd-header { display:flex; justify-content:space-between; align-items:center; gap:1rem; }
  .gd-controls input { padding:0.5rem; border-radius:6px; border:1px solid #ddd; }
  .gd-stats { display:flex; gap:1rem; margin:1rem 0; }
  .stat { background:#fff; padding:0.75rem 1rem; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05); }
  .gd-lists { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  .list-card { background:#fff; padding:1rem; border-radius:8px; }
  table { width:100%; border-collapse:collapse; }
  th, td { padding:0.5rem; text-align:left; border-bottom:1px solid #f0f0f0; }
  .btn-admit { background:#16a34a; color:white; padding:0.35rem 0.6rem; border-radius:6px; border:none; }
  .btn-deny { background:#ef4444; color:white; padding:0.35rem 0.6rem; border-radius:6px; border:none; }
  .gd-events { margin-top:1rem; background:#fff; padding:1rem; border-radius:8px; }
  @media (max-width:900px){ .gd-lists{grid-template-columns:1fr} }
</style>
