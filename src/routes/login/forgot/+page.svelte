<script lang="ts">
  import Card from '$lib/ui/Card.svelte';
  let username = '';
  let message: string | null = null;
  let error: string | null = null;
  let loading = false;

  async function submitForgot() {
    message = null;
    error = null;
    if (!username.trim()) {
      error = 'Please enter your username or email';
      return;
    }
    loading = true;
    try {
      const form = new FormData();
      form.append('username', username.trim());
      const res = await fetch('/login/forgot', { method: 'POST', body: form, credentials: 'same-origin' });
      const text = await res.text().catch(() => null);
      let data: any = null;
      if (text) {
        try { data = JSON.parse(text); } catch (e) { }
      }
      if (!res.ok) {
        error = data?.error || text || 'Failed to request password reset';
        return;
      }
      message = data?.message || text || 'If that account exists, a reset email has been sent.';
    } catch (e: any) {
      error = e?.message || 'Network error';
    } finally {
      loading = false;
    }
  }
</script>

<section class="login-viewport">
  <div class="login-container">
    <svelte:component this={Card} className="login-section" padding="2.25rem">
      <div class="brand">
        <div class="logo">RAMS</div>
        <div class="title">Residence Access Management System</div>
      </div>
      <div class="login-form">
        <h2>Forgot password</h2>
        {#if error}<div class="error">{error}</div>{/if}
        {#if message}<div class="message">{message}</div>{/if}
        <label>Username or email
          <input bind:value={username} autocomplete="username" />
        </label>
        <button class="login-btn" on:click={submitForgot} disabled={loading}>{loading ? 'Sending...' : 'Request reset'}</button>
      </div>
    </svelte:component>
  </div>
</section>

<style>
/* reuse login page styles for layout; keep minimal overrides */
.login-viewport{position:fixed;inset:0;display:grid;place-items:center;padding:1.5rem;background: linear-gradient(180deg,#f4f7fb,#eef4fb)}
.login-container{width:100%;max-width:520px;margin:0 auto}
</style>
