<script lang="ts">
  export let form;
  let plateNumber = '';
  let name = '';
  let phone = '';
  let durationMinutes = 30;
</script>

<div class="create-food-delivery-pass">
  <a href="/user/dashboard/food-delivery" class="back-btn">&larr; Back to Food Delivery</a>
  <h2>Create Food Delivery Pass</h2>
  <form method="POST">
    <label>Plate Number <input name="plateNumber" bind:value={plateNumber} required /></label>
    <label>Name <input name="name" bind:value={name} required /></label>
    <label>Phone <input name="phone" bind:value={phone} required /></label>
    <label>Duration (minutes) <input name="durationMinutes" type="number" bind:value={durationMinutes} min="10" max="120" required /></label>
    <button type="submit" class="btn">Grant Access</button>
  </form>
  {#if form?.error}
    <div class="error">{form.error}</div>
  {/if}
</div>

