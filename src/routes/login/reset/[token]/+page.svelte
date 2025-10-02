<script lang="ts">
  import { page } from '$app/stores';
  import Card from '$lib/ui/Card.svelte';
  import { get } from 'svelte/store';

  let password = '';
  let passwordConfirm = '';
  let message: string | null = null;
  let error: string | null = null;
  let loading = false;

  const token: string | undefined = get(page).params.token;

  async function submitReset() {
    message = null;
    error = null;
    if (!password) { error = 'Please enter a new password'; return; }
    if (password !== passwordConfirm) { error = 'Passwords do not match'; return; }
    loading = true;
    try {
  const form = new FormData();
  // token may be undefined in some editor/typecheck contexts; ensure we append a string
  form.append('token', token ?? '');
      form.append('password', password);
      const res = await fetch('/login/reset', { method: 'POST', body: form, credentials: 'same-origin' });
      const text = await res.text().catch(() => null);
      let data: any = null;
      if (text) {
        try { data = JSON.parse(text); } catch (e) { }
      }
      if (!res.ok) {
        error = data?.error || text || 'Failed to reset password';
        return;
      }
      message = data?.message || text || 'Password reset. You can now login.';
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
        <h2>Reset password</h2>
        {#if error}<div class="error">{error}</div>{/if}
        {#if message}<div class="message">{message}</div>{/if}
        <label>New password
          <input type="password" bind:value={password} autocomplete="new-password" />
        </label>
        <label>Confirm password
          <input type="password" bind:value={passwordConfirm} autocomplete="new-password" />
        </label>
        <button class="login-btn" on:click={submitReset} disabled={loading}>{loading ? 'Resetting...' : 'Reset password'}</button>
      </div>
    </svelte:component>
  </div>
</section>

<style>
.login-viewport{position:fixed;inset:0;display:grid;place-items:center;padding:1.5rem;background: linear-gradient(180deg,#f4f7fb,#eef4fb)}
.login-container{width:100%;max-width:520px;margin:0 auto}
</style>
