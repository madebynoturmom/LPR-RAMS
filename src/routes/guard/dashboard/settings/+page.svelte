<script lang="ts">
  import { page } from '$app/stores';
  import { invalidate } from '$app/navigation';
  let profilePic: string | null = null;
  let username = '';
  let currentPassword = '';
  let newPassword = '';
  let message = '';
  let passwordMessage = '';

  $: if ($page.data.user) {
    profilePic = $page.data.user.profilePic || null;
    username = $page.data.user.username || '';
    const name = $page.data.user.name || username || 'G';
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) userInitials = 'G';
    else if (parts.length === 1) userInitials = parts[0].slice(0,2).toUpperCase();
    else userInitials = (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
  }

  let userInitials = 'G';

  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        profilePic = e.target?.result as string;
      };
      reader.readAsDataURL(target.files[0]);
    }
  }

  async function submitProfile(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    try {
      const res = await fetch('?/updateProfile', { method: 'POST', body: formData });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        message = data?.message || 'Profile updated';
        await invalidate('/guard/dashboard');
      } else {
        message = data?.error || 'Failed to update profile';
      }
    } catch (e) {
      console.error(e);
      message = 'Network error';
    }
  }

  async function submitPassword(event: Event) {
    event.preventDefault();
    if (!currentPassword || !newPassword) {
      passwordMessage = 'Please fill both fields';
      return;
    }
    const form = new FormData();
    form.append('currentPassword', currentPassword);
    form.append('newPassword', newPassword);
    try {
      const res = await fetch('?/changePassword', { method: 'POST', body: form });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        passwordMessage = data?.message || 'Password updated';
        currentPassword = '';
        newPassword = '';
      } else {
        passwordMessage = data?.error || 'Failed to update password';
      }
    } catch (e) {
      console.error(e);
      passwordMessage = 'Network error';
    }
  }
</script>

<a href="/guard/dashboard" class="back-btn">&larr; Back to Dashboard</a>

<div class="profile-card move-up">
  <h1>Account Settings</h1>
  <div class="profile-forms-row">
    <div class="profile-settings-col">
      <form class="profile-form" on:submit|preventDefault={submitProfile} enctype="multipart/form-data">
        <div class="profile-pic-section">
          {#if profilePic}
            <img src={profilePic} alt="Profile preview" class="profile-pic-preview" />
          {:else}
            <div class="profile-placeholder-large">{userInitials}</div>
          {/if}
          <label for="profilePicture" class="upload-label">
            <span>Change Photo</span>
            <input id="profilePicture" name="profilePicture" type="file" accept="image/*" on:change={handleFileChange} />
          </label>
        </div>
        <div class="form-grid">
          <div class="form-row">
            <label for="username">Username</label>
            <input id="username" name="username" type="text" value={username} readonly />
          </div>
        </div>
        <button class="save-btn" type="submit">Save Changes</button>
        {#if message}
          <div class="message">{message}</div>
        {/if}
      </form>
    </div>
    <div class="password-col">
      <form class="password-form" on:submit|preventDefault={submitPassword} autocomplete="off">
        <h2>Change Password</h2>
        <div class="form-row">
          <label for="currentPassword">Current Password</label>
          <input id="currentPassword" type="password" bind:value={currentPassword} required autocomplete="current-password" />
        </div>
        <div class="form-row">
          <label for="newPassword">New Password</label>
          <input id="newPassword" type="password" bind:value={newPassword} required autocomplete="new-password" />
        </div>
        <button class="save-btn password-btn" type="submit">Update Password</button>
        {#if passwordMessage}
          <div class="message">{passwordMessage}</div>
        {/if}
      </form>
    </div>
  </div>
</div>

<style>
.back-btn { display: inline-block; margin-bottom: 1.5rem; background: #e0e0e0; color: #000; padding: 0.4rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 500; }
.back-btn:hover { background: #d6d6d6; }

.profile-settings-col { min-width: 0; }
.password-col { min-width: 270px; max-width: 350px; display: flex; flex-direction: column; align-items: stretch; }
.profile-forms-row { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2.5rem; max-width: 800px; margin: 2rem auto 0 auto; align-items: flex-start; justify-content: center; width: 100%; }
@media (max-width: 900px) { .profile-forms-row { display: block; } .password-col { max-width: 100%; margin-top: 1.5rem; } }

.profile-card.move-up { max-width: 600px; margin: 1rem auto 2.5rem auto; background: #fff; border-radius: 18px; box-shadow: 0 6px 32px rgba(25, 118, 210, 0.10); padding: 2.5rem 2.5rem 2rem 2.5rem; overflow: visible; display: flex; flex-direction: column; align-items: center; }
@media (max-width: 900px) { .profile-card.move-up { margin-top: 0.5rem; padding: 1.2rem 0.5rem; } }

.profile-form { width: 100%; display: flex; flex-direction: column; align-items: center; }
.form-grid { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem 2rem; margin-bottom: 1.7rem; }
@media (max-width: 900px) { .form-grid { grid-template-columns: 1fr; gap: 1.2rem 0; } }
.form-row { display: flex; flex-direction: column; gap: 0.5rem; }
.profile-pic-preview { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-bottom: 1rem; }
.upload-label input { display: none; }
.save-btn { background:#1976d2;color:#fff;padding:.6rem;border-radius:8px;border:0 }
.password-btn { margin-top: 1rem }
.message { color: green }
</style>
