<script lang="ts">
  import { goto } from '$app/navigation';
  let username = '';
  let password = '';
  let name = '';
  let email = '';
  let phone = '';
  let profilePic: File | null = null;
  let profilePicPreview: string | null = null;
  let error: string | null = null;
  let creating = false;

  async function handleSubmit(e: Event) {
    e.preventDefault();
    creating = true;
    error = null;
    const hash = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    const formData = new FormData();
    formData.set('username', username);
    formData.set('passwordHash', hashHex);
    formData.set('name', name);
    formData.set('email', email);
    formData.set('phone', phone);
    if (profilePic) formData.set('profilePic', profilePic);
    const res = await fetch('./create', { method: 'POST', body: formData });
    if (!res.ok) error = 'Failed to create admin';
    creating = false;
    if (res.ok) goto('/admin/dashboard/admins');
  }
</script>

<section class="admin-section">
  <button type="button" class="back-btn" on:click={() => history.back()}>&larr; Back</button>
  <h2 class="admin-title">Add New Admin</h2>
  {#if error}
    <div class="error">{error}</div>
  {/if}
  <form on:submit={handleSubmit} class="create-admin-form">
    <div class="form-grid">
      <label>Username <input class="text-input" type="text" bind:value={username} required /></label>
      <label>Password <input class="text-input" type="password" bind:value={password} required /></label>
      <label>Name <input class="text-input" type="text" bind:value={name} /></label>
      <label>Email <input class="text-input" type="email" bind:value={email} /></label>
      <label>Phone <input class="text-input" type="text" bind:value={phone} /></label>
    </div>
    <label class="profile-upload">Profile Picture
      <input type="file" accept="image/*" on:change={e => {
        const file = (e.target as HTMLInputElement).files?.[0] ?? null;
        profilePic = file;
        if (file) {
          const reader = new FileReader();
          reader.onload = ev => profilePicPreview = ev.target?.result as string;
          reader.readAsDataURL(file);
        } else {
          profilePicPreview = null;
        }
      }} />
    </label>
    <div class="avatar-preview">
      {#if profilePicPreview}
        <img src={profilePicPreview} alt="Preview" />
      {:else}
        <img src="/default-profile.png" alt="Default profile placeholder" />
      {/if}
    </div>
    <button type="submit" class="btn btn-create primary-cta" disabled={creating}>Create Admin</button>
  </form>
</section>

<!-- styles moved to subpage.css -->
