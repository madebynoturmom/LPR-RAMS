<script lang="ts">
  import { page } from '$app/stores';
  export let data;
  let resident = data.resident;
</script>

 

<div class="subpage-container">
  <div class="subpage-card">
    <div class="subpage-header">
      <div>
        <button type="button" class="back-btn" on:click={() => window.location.href = '/admin/dashboard/residents'}>&larr; Back</button>
        <h2 class="subpage-title">Resident Details</h2>
      </div>
    </div>
  {#if resident}
    <ul class="resident-detail-list">
      <li><strong>Name:</strong> {resident.name}</li>
      <li><strong>Email:</strong> {resident.email}</li>
      <li><strong>Phone:</strong> {resident.phone}</li>
      <li><strong>Car Number:</strong> {resident.carNumber}</li>
      <li><strong>House Address:</strong> {resident.houseAddress}</li>
    </ul>
  {:else}
    <div class="error">Resident not found.</div>
  {/if}
  </div>
</div>

<!-- styles moved to subpage.css -->
