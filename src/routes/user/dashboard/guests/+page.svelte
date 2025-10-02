<script lang="ts">
  export let data;
  let { guestPasses } = data;
</script>

<div class="guest-page-container">
  <a href="/user/dashboard" class="back-btn">&larr; Back to Dashboard</a>
  <h2>Your Guest Passes</h2>
  <a href="/user/dashboard/guests/create" class="add-btn">+ Create Guest Pass</a>
  {#if guestPasses.length === 0}
    <p>No guest passes found for your account.</p>
  {:else}
    <ul class="guest-pass-list">
      {#each guestPasses as g}
        <li>
          <strong>Plate:</strong> {g.plateNumber}<br />
          <strong>Visit Time:</strong> {new Date(g.visitTime).toLocaleString()}<br />
          <strong>Duration:</strong> {g.durationMinutes} minutes<br />
          <form method="POST" action="?/revoke" style="display:inline">
            <input type="hidden" name="id" value={g.id} />
            <button type="submit" class="revoke-btn">Revoke</button>
          </form>
    <form method="POST" action="?/extend" class="extend-form">
      <input type="hidden" name="id" value={g.id} />
      <label for="extend-{g.id}" class="extend-label">Add minutes:</label>
      <input id="extend-{g.id}" type="number" name="duration" min="1" step="1" placeholder="30" class="duration-input" required />
      <button type="submit" class="extend-btn">Extend</button>
    </form>
  </li>
      {/each}
    </ul>
  {/if}
</div>


