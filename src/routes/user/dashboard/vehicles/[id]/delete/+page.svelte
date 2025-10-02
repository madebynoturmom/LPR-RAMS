<script lang="ts">
  export let data;
  export let form;
  let { vehicle } = data;
</script>

<h2>Delete Vehicle</h2>
<p>Are you sure you want to delete this vehicle?</p>
<ul>
  <li><strong>{vehicle.model}</strong> ({vehicle.makeYear})</li>
  <li>Plate: {vehicle.plateNumber}</li>
</ul>
<form method="POST">
  <button type="submit" class="delete-btn">Delete</button>
</form>
{#if form?.success}
  <div class="success">Vehicle deleted!</div>
{/if}
{#if form?.error}
  <div class="error">{form.error}</div>
{/if}


