<script lang="ts">
  export let form;
  let model = '';
  let makeYear = '';
  let plateNumber = '';
</script>

<h2>Add Vehicle</h2>
<form method="POST">
  <label>Model <input name="model" bind:value={model} required /></label>
  <label>Make Year <input name="makeYear" type="number" bind:value={makeYear} required /></label>
  <label>Plate Number <input name="plateNumber" bind:value={plateNumber} required /></label>
  <button type="submit" class="btn">Add Vehicle</button>
</form>
{#if form?.error}
  <div class="error">{form.error}</div>
{/if}


