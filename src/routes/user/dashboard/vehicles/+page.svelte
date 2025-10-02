<script lang="ts">
  export let data;
  let { vehicles } = data;
</script>

<div class="vehicle-page-container">
  <a href="/user/dashboard" class="back-btn">&larr; Back to Dashboard</a>
  <h2>Your Vehicles</h2>
  <a href="/user/dashboard/vehicles/create" class="add-btn">+ Add Vehicle</a>
  {#if vehicles.length === 0}
    <p>No vehicles found for your account.</p>
  {:else}
    <ul class="vehicle-list">
      {#each vehicles as v}
        <li>
          <strong>Plate: {v.plateNumber}</strong><br />
          {#if v.accessTime}
            Last Access: {v.accessTime}<br />
          {/if}
          <a href={`/user/dashboard/vehicles/${v.id}/edit`} class="edit-link">Edit</a>
          <a href={`/user/dashboard/vehicles/${v.id}/delete`} class="delete-link">Delete</a>
        </li>
      {/each}
    </ul>
  {/if}
</div>


