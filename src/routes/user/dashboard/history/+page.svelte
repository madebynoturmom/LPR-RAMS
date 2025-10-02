<script lang="ts">
  export let data;
  let { pastPasses } = data;
</script>

<div class="history-page-container">
  <a href="/user/dashboard" class="back-btn">&larr; Back to Dashboard</a>
  <h2>Pass History</h2>
  <p class="history-description">View your past guest passes and food delivery passes that have expired or been revoked.</p>

  {#if pastPasses.length === 0}
    <p>No past passes found.</p>
  {:else}
    <div class="history-stats">
      <div class="stat-item">
        <span class="stat-number">{pastPasses.length}</span>
        <span class="stat-label">Total Past Passes</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{pastPasses.filter(p => p.reason === 'revoked').length}</span>
        <span class="stat-label">Manually Revoked</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{pastPasses.filter(p => p.reason === 'expired').length}</span>
        <span class="stat-label">Expired</span>
      </div>
    </div>

    <div class="passes-container">
      {#each pastPasses as pass}
        <div class="pass-card" class:revoked={pass.reason === 'revoked'} class:expired={pass.reason === 'expired'}>
          <div class="pass-header">
            <div class="pass-type">
              {pass.type === 'visitors' ? '👥 Guest Pass' : '🍕 Food Delivery'}
            </div>
            <div class="pass-status">
              {#if pass.reason === 'revoked'}
                <span class="status-badge revoked">Revoked</span>
              {:else}
                <span class="status-badge expired">Expired</span>
              {/if}
            </div>
          </div>

          <div class="pass-details">
            <div class="detail-row">
              <strong>Plate:</strong> {pass.plateNumber}
            </div>
            {#if pass.name}
              <div class="detail-row">
                <strong>Name:</strong> {pass.name}
              </div>
            {/if}
            {#if pass.phone}
              <div class="detail-row">
                <strong>Phone:</strong> {pass.phone}
              </div>
            {/if}
            <div class="detail-row">
              <strong>Visit Time:</strong> {new Date(pass.visitTime).toLocaleString()}
            </div>
            <div class="detail-row">
              <strong>Duration:</strong> {pass.durationMinutes} minutes
            </div>
            {#if pass.reason === 'revoked' && 'revokedAt' in pass}
              <div class="detail-row">
                <strong>Revoked At:</strong> {new Date((pass as any).revokedAt).toLocaleString()}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

