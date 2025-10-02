<script lang="ts">
  export let data;
  let resident = data.resident;
  let error = null;
  let success = null;
</script>

 

<div class="subpage-container">
  <div class="subpage-card">
    <div class="subpage-header">
      <div>
        <button type="button" class="back-btn" on:click={() => window.location.href = '/admin/dashboard/residents'}>&larr; Back</button>
        <h2 class="subpage-title">Edit Resident</h2>
      </div>
    </div>
  {#if error}
    <div class="error">{error}</div>
  {/if}
  {#if success}
    <div class="success">{success}</div>
  {/if}
  {#if resident}
    <form method="POST" class="resident-form">
      <label>Name<input name="name" value={resident.name} required /></label>
      <label>Email<input name="email" type="email" value={resident.email} required /></label>
      <label>Phone Number<input name="phone" value={resident.phone} required /></label>
      <label>Car Number<input name="carNumber" value={resident.carNumber} required /></label>
      <label>House Address<input name="houseAddress" value={resident.houseAddress} required /></label>
      <button type="submit" class="btn btn-update">Update Resident</button>
    </form>
  {:else}
    <div class="error">Resident not found.</div>
  {/if}
  </div>
</div>

<!-- styles moved to subpage.css -->
