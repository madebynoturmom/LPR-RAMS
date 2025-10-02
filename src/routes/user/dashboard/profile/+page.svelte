<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { invalidate } from '$app/navigation';
  let name = '';
  let email = '';
  let username = '';
  let password = '';
  let currentPassword = '';
  let newPassword = '';
  let passwordMessage = '';

  async function handlePasswordChange(event: Event) {
    event.preventDefault();
    // TODO: Implement password change logic (API call)
    if (!currentPassword || !newPassword) {
      passwordMessage = 'Please fill in both fields.';
      return;
    }
    // Simulate success
    passwordMessage = 'Password updated successfully!';
    currentPassword = '';
    newPassword = '';
  }
  let phone = '';

  let houseAddress = '';
  let profilePic: string | null = null;
  let message = '';

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

  // Initialize form with user data
  $: if ($page.data.user) {
    const user = $page.data.user;
    name = user.name || '';
    email = user.email || '';
    username = user.username || '';
    phone = user.phone || '';
    houseAddress = user.houseAddress || '';
    profilePic = user.profilePic || null;
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const response = await fetch('/user/dashboard/profile', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        message = result.message || 'Profile updated successfully!';
        // Invalidate the page data to refresh the profile information
        await invalidate('app:profile');
        // Also invalidate the dashboard layout to update sidebar profile pic
        await invalidate('/user/dashboard');
      } else {
        message = result.error || 'Failed to update profile.';
      }
    } catch (error) {
      console.error('Profile update error:', error);
      message = 'An error occurred while updating your profile.';
    }
  }
</script>

<a href="/user/dashboard" class="back-btn">&larr; Back to Dashboard</a>

<div class="profile-card move-up">
  <h1>Account Settings</h1>
  <div class="profile-forms-row">
    <div class="profile-settings-col">
      <form class="profile-form" on:submit|preventDefault={handleSubmit} enctype="multipart/form-data">
        <div class="profile-pic-section">
          <img src={profilePic || '/default-profile.png'} alt="Profile preview" class="profile-pic-preview" />
          <label for="profilePicture" class="upload-label">
            <span>Change Photo</span>
            <input id="profilePicture" name="profilePicture" type="file" accept="image/*" on:change={handleFileChange} />
          </label>
        </div>
        <div class="form-grid">
          <div class="form-row">
            <label for="username">Username</label>
            <input id="username" name="username" type="text" bind:value={username} required />
          </div>
          <div class="form-row">
            <label for="name">Name</label>
            <input id="name" name="name" type="text" bind:value={name} required />
          </div>
          <div class="form-row">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" bind:value={email} required />
          </div>
          <div class="form-row">
            <label for="phone">Phone</label>
            <input id="phone" name="phone" type="text" bind:value={phone} />
          </div>
          <div class="form-row">
            <label for="houseAddress">House Address</label>
            <input id="houseAddress" name="houseAddress" type="text" bind:value={houseAddress} />
          </div>
        </div>
        <button class="save-btn" type="submit">Save Changes</button>
        {#if message}
          <div class="message">{message}</div>
        {/if}
      </form>
    </div>
    <div class="password-col">
      <form class="password-form" on:submit|preventDefault={handlePasswordChange} autocomplete="off">
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

