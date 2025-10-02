<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let username = '';
  let password = '';
  let otp = '';
  let remember = false;
  let otpSent = false;
  let busy = false;
  let message: string | null = null;
  let error: string | null = null;
  let identifiedRole: string | null = null;

  // Focus OTP input when sent
  let otpInput: HTMLInputElement | null = null;
  $: if (otpSent) setTimeout(() => otpInput?.focus(), 0);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = null;
    message = null;
    busy = true;
    // If we don't yet know the role, identify synchronously before submitting
    if (!identifiedRole && username && username.trim()) {
      try {
        const url = new URL('/login/identify', location.origin);
        url.searchParams.set('username', username.trim());
        const idRes = await fetch(url.toString(), { method: 'GET', credentials: 'same-origin' });
        if (idRes.ok) {
          const idData = await idRes.json().catch(() => null);
          if (idData && idData.role) identifiedRole = idData.role;
        }
      } catch (err) {
        // ignore
      }
    }
    try {
      const form = new FormData();
      form.set('username', username.trim());
      if (password) form.set('password', password);
      if (otp) form.set('otp', otp.trim());
      if (remember) form.set('remember', '1');

  const res = await fetch('/login', { method: 'POST', body: form, headers: { accept: 'application/json' }, credentials: 'same-origin' });
      // If the server used a redirect (Set-Cookie + redirect), follow it immediately
      if (res.redirected) {
        // force a full navigation so cookies and session are properly set
        window.location.assign(res.url);
        return;
      }

      // Read response as text first (works for JSON or plain text responses)
      const text = await res.text().catch(() => null);
      let data: any = null;
      if (text) {
        try { data = JSON.parse(text); } catch (_) { data = null; }
      }

      // If server indicates OTP was sent (JSON) or the text mentions OTP, enable OTP input
      const textLower = (text || '').toLowerCase();
      if (data?.otpSent || textLower.includes('otp sent') || textLower.includes('one-time') || textLower.includes('one time')) {
        otpSent = true;
        // clear password input to avoid sending it on OTP verification
        password = '';
        message = (data && data.message) || text || 'OTP sent to your email.';
        return;
      }

      if (data?.redirect) {
        // force a full navigation to ensure session cookies are applied
        window.location.assign(data.redirect);
        return;
      }

      if (!res.ok) {
        error = data?.error || `Request failed (${res.status})`;
        return;
      }

      if (data?.success) {
        otpSent = false;
        if (data.redirect) window.location.assign(data.redirect);
        else window.location.assign('/');
        return;
      }

      // If the text contains a URL (rare), navigate to it
      if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('/'))) {
        otpSent = false;
        window.location.assign(text.trim());
        return;
      }

      // If this request included an OTP (we're verifying) and the server returned OK
      // but didn't explicitly return redirect/success JSON, force a reload so
      // server-side session/cookies take effect and the user will be redirected.
      if (otp && res.ok && !data?.error && !data?.redirect && !data?.success) {
        otpSent = false;
        window.location.reload();
        return;
      }

  // fallback: if we have text but no JSON data, show it
  if (text && !data) message = text;
    } catch (err: any) {
      error = String(err?.message ?? err) || 'Unexpected error';
    } finally {
      busy = false;
    }
  }

  // Identify the user's role by calling the server endpoint
  let identifyTimer: any = null;
  async function identifyUser() {
    identifiedRole = null;
    if (!username || !username.trim()) return;
    // Debounce quick changes
    if (identifyTimer) clearTimeout(identifyTimer);
    identifyTimer = setTimeout(async () => {
      try {
        const url = new URL('/login/identify', location.origin);
        url.searchParams.set('username', username.trim());
        const res = await fetch(url.toString(), { method: 'GET', credentials: 'same-origin' });
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        if (data && data.role) identifiedRole = data.role;
      } catch (err) {
        // ignore identify errors
        identifiedRole = null;
      }
    }, 250);
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-50 px-4">
  <div class="w-full max-w-md md:max-w-lg bg-white rounded-xl shadow-lg p-6 md:p-10">
    <div class="mb-4 text-center">
  <h1 class="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent">RAMS</h1>
      <h2 class="text-sm md:text-base text-slate-700">Residential Access Management</h2>
    </div>

    <form on:submit|preventDefault={handleSubmit} class="grid gap-4" autocomplete="off">
      {#if message}
        <div class="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded">{message}</div>
      {/if}
      {#if error}
        <div class="text-sm text-red-700 bg-red-50 px-3 py-2 rounded">{error}</div>
      {/if}

      <div class="grid gap-2">
        <label for="username" class="text-sm text-slate-700">Username</label>
  <input id="username" name="username" type="text" bind:value={username} required on:blur={() => identifyUser()} on:input={() => identifyUser()} class="mt-1 px-4 py-2 rounded-lg border border-slate-400 w-full focus:outline-none focus:ring-2 focus:ring-sky-200" />
      </div>

      {#if identifiedRole === 'guard' && !otpSent}
        <div class="grid gap-2">
          <div class="flex items-center justify-between">
            <label for="password" class="text-sm text-slate-700">Password</label>
            <a href="/login/forgot" class="text-xs text-sky-600 hover:underline">Forgot your password?</a>
          </div>
          <input id="password" name="password" type="password" bind:value={password} placeholder="Password" class="mt-1 px-4 py-3 rounded-lg border border-slate-200 w-full focus:outline-none focus:ring-2 focus:ring-sky-200" />
        </div>
      {/if}

      {#if otpSent}
        <div class="grid gap-2">
          <label for="otp" class="text-sm text-slate-700">OTP</label>
          <input id="otp" name="otp" bind:this={otpInput} type="text" inputmode="numeric" maxlength="6" bind:value={otp} class="mt-1 px-4 py-3 rounded-lg border border-slate-200 w-full text-center focus:outline-none focus:ring-2 focus:ring-sky-200" />
        </div>
      {/if}

      <div class="flex items-center justify-between gap-2">
        <label class="text-sm flex items-center gap-2"><input type="checkbox" name="remember" bind:checked={remember} class="h-4 w-4" /> Remember me</label>
      </div>

      <div>
        <button type="submit" class="w-full bg-sky-600 text-white py-3 rounded-lg text-sm md:text-base" disabled={busy}>
          {#if busy}Processing...{/if}
          {#if !busy}{otpSent ? 'Verify OTP' : 'Login / Send OTP'}{/if}
        </button>
      </div>

      <div class="mt-3 text-center">
        <a href="/login/forgot" class="text-xs text-sky-600 hover:underline">Forgot your password?</a>
      </div>
    </form>
  </div>
</div>



