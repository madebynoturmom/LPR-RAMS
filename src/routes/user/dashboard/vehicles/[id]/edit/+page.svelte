<script lang="ts">
  export let data;
  let { vehicle } = data;
  let model = vehicle.model || '';
  let makeYear = vehicle.makeYear || '';
  let plateNumber = vehicle.plateNumber || '';
  let error = '';
  let success = false;

  async function handleSubmit(event: Event) {
    event.preventDefault();
    const form = new FormData(event.target as HTMLFormElement);
    const res = await fetch('', { method: 'POST', body: form });
    const result = await res.json();
    if (result.success) {
      success = true;
      error = '';
    } else {
      error = result.error || 'Failed to update vehicle.';
      success = false;
    }
  }
</script>

<h2>Edit Vehicle</h2>
<form on:submit|preventDefault={handleSubmit}>
  <label>Model <input name="model" bind:value={model} required /></label>
  <label>Make Year <input name="makeYear" type="number" bind:value={makeYear} required /></label>
  <label>Plate Number <input name="plateNumber" bind:value={plateNumber} required /></label>
  <button type="submit">Save Changes</button>
</form>
{#if success}
  <div class="success">Vehicle updated!</div>
{/if}
{#if error}
  <div class="error">{error}</div>
{/if}


