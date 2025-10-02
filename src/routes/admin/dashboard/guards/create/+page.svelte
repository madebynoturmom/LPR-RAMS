<script lang="ts">
  let error: string | null = null;
  let success: string | null = null;
</script>

<section class="admin-section">
  <button type="button" class="back-btn" on:click={() => window.location.href = '/admin/dashboard/guards'}>&larr; Back</button>
  <h2>Add Guard</h2>
  {#if error}
    <div class="error">{error}</div>
  {/if}
  {#if success}
    <div class="success">{success}</div>
  {/if}
  <form method="POST" class="resident-form" enctype="multipart/form-data">
    <label>Guard Name<input name="name" required /></label>
    <label>Phone Number<input name="phone" required /></label>
    <label>Guard ID<input name="guardId" required /></label>
    <label>Profile Picture
      <input type="file" name="profilePic" accept="image/*" />
    </label>
    <button type="submit" class="btn btn-update">Add Guard</button>
  </form>
</section>

