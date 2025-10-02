<script lang="ts">
  export let data;
  let { foodDeliveryPasses } = data;
</script>

<div class="food-delivery-page-container">
  <a href="/user/dashboard" class="back-btn">&larr; Back to Dashboard</a>
  <h2>Your Food Delivery Passes</h2>
  <a href="/user/dashboard/food-delivery/create" class="add-btn">+ Create Food Delivery Pass</a>
  {#if foodDeliveryPasses.length === 0}
    <p>No food delivery passes found for your account.</p>
  {:else}
    <ul class="food-delivery-pass-list">
      {#each foodDeliveryPasses as f}
        <li>
          <strong>Plate:</strong> {f.plateNumber}<br />
          <strong>Visit Time:</strong> {new Date(f.visitTime).toLocaleString()}<br />
          <strong>Duration:</strong> {f.durationMinutes} minutes<br />
          <form method="POST" action="?/revoke" style="display:inline">
            <input type="hidden" name="id" value={f.id} />
            <button type="submit" class="revoke-btn">Revoke</button>
          </form>
          <form method="POST" action="?/extend" class="extend-form">
            <input type="hidden" name="id" value={f.id} />
            <label for="extend-{f.id}" class="extend-label">Add minutes:</label>
            <input id="extend-{f.id}" type="number" name="duration" min="1" step="1" placeholder="30" class="duration-input" required />
            <button type="submit" class="extend-btn">Extend</button>
          </form>
        </li>
      {/each}
    </ul>
  {/if}
</div>


