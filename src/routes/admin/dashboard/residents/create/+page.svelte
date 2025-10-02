<script lang="ts">
  let error: string | null = null;
  let success: string | null = null;

  // Submit the form via fetch and redirect back to the Manage Residents page on success.
  // This preserves the non-JS fallback because the form has a normal POST; this handler
  // only runs when JS is available.
  async function submitForm(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    try {
      const res = await fetch(form.action || window.location.pathname, {
        method: 'POST',
        body: fd,
        redirect: 'follow'
      });

      // If the server redirected or responded OK, navigate to the list page.
      if (res.redirected || res.status === 303 || res.ok) {
        window.location.href = '/admin/dashboard/residents';
        return;
      }

      // Try to show any error text returned by the server.
      const text = await res.text();
      error = text || 'Failed to create resident.';
    } catch (err) {
      error = 'Network error while creating resident.';
    }
  }
</script>

 

<div class="subpage-container">
  <div class="subpage-card">
    <div class="subpage-header">
      <div>
        <button type="button" class="back-btn" on:click={() => window.location.href = '/admin/dashboard/residents'}>&larr; Back</button>
        <h2 class="subpage-title">Add Resident</h2>
      </div>
    </div>
  {#if error}
    <div class="error">{error}</div>
  {/if}
  {#if success}
    <div class="success">{success}</div>
  {/if}
  <form method="POST" class="resident-form" on:submit|preventDefault={submitForm}>
    <label>Name<input name="name" required /></label>
    <label>Email<input name="email" type="email" required /></label>
    <label>Phone Number<input name="phone" required /></label>
    <label>Car Number<input name="carNumber" required /></label>
    <label>House Address<input name="houseAddress" required /></label>
    <button type="submit" class="btn btn-update">Add Resident</button>
  </form>
  </div>
</div>

<!-- styles moved to subpage.css -->
