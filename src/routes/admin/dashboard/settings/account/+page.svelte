<script lang="ts">
  import { enhance } from '$app/forms';
  export let data: any;

  let name = data?.user?.name ?? '';
  let email = data?.user?.email ?? '';
  let username = data?.user?.username ?? '';
  let profilePic = data?.user?.profilePic ?? '';

  function handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      profilePic = URL.createObjectURL(file);
    }
  }
</script>

<div class="dashboard-container">
  <header class="dashboard-overview">
    <div class="overview-left">
      <div class="overview-text">
        <h1 class="overview-title">Account</h1>
        <div class="overview-date">Manage account information</div>
      </div>
    </div>
  </header>

  <section class="settings-section">
    <form method="POST" enctype="multipart/form-data" use:enhance>
      <div class="subpage-card settings-card">
        <div class="subpage-header"><h1 class="subpage-title">Account Settings</h1></div>
        <div class="profile-pic-section">
          <img src={profilePic || '/default-profile.png'} alt="Profile preview" class="profile-pic-preview" />
          <label for="profilePicture" class="upload-label">Change Photo
            <input id="profilePicture" name="profilePicture" type="file" accept="image/*" on:change={handleFileChange} />
          </label>
        </div>
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
          <label for="password">New Password</label>
          <input id="password" name="password" type="password" placeholder="Leave blank to keep current password" autocomplete="new-password" />
        </div>
        <button class="save-btn" type="submit">Save Changes</button>
      </div>
    </form>
  </section>
</div>
