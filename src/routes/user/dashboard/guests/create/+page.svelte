<script lang="ts">
  export let form;
  let plateNumber = '';
  let name = '';
  let phone = '';
  let visitTime = '';
  let durationMinutes = 60;
</script>

<a href="/user/dashboard" class="back-btn outside-back" aria-label="Back to dashboard">← Back to Dashboard</a>

<div class="page-container">
  <div class="page-header center-heading">
    <h2>Create Guest Pass</h2>
  </div>

  <div class="form-wrap">
    <form method="POST" class="guest-form">
  <label>
    Plate Number:
    <input type="text" name="plateNumber" bind:value={plateNumber} required />
  </label>
  <label>
    Name:
    <input type="text" name="name" bind:value={name} required />
  </label>
  <label>
    Phone:
    <input type="text" name="phone" bind:value={phone} required />
  </label>
  <label>
    Visit Time:
    <input name="visitTime" type="datetime-local" bind:value={visitTime} required />
  </label>
  <label>
    Duration (minutes):
    <input name="durationMinutes" type="number" bind:value={durationMinutes} min="10" max="480" required />
  </label>
  <button type="submit" class="btn">Create Guest Pass</button>
    </form>
  </div>
</div>

{#if form?.error}
  <div class="error">{form.error}</div>
{/if}


