
<script>
  export let data;
  let events = data?.events ?? [];

  // sample events for development preview
  const sampleEvents = [
    { type: 'login', userName: 'Admin', details: 'Signed in', time: '2025-09-22 09:12' },
    { type: 'guest_pass_issued', userName: 'Alice', details: 'Issued 1 guest pass', time: '2025-09-22 10:01' },
    { type: 'vehicle_registered', userName: 'Bob', details: 'Plate R123', time: '2025-09-21 14:32' }
  ];

  const displayedEvents = (events && events.length > 0) ? events : (import.meta.env.DEV ? sampleEvents : []);
</script>

 

<div class="subpage-container">
  <div class="subpage-card">
    <div class="subpage-header">
      <div>
        <button type="button" class="back-btn" on:click={() => window.location.href = '/admin/dashboard'}>&larr; Back</button>
        <h2 class="subpage-title">Event Logs</h2>
      </div>
    </div>
  {#if displayedEvents.length > 0}
    <table class="event-table">
      <thead>
        <tr>
          <th>Type</th>
          <th>User</th>
          <th>Details</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {#each displayedEvents as event}
          <tr>
            <td>{event.type}</td>
            <td>{event.userName}</td>
            <td>{event.details}</td>
            <td>{event.time}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p>No event logs found.</p>
  {/if}
  </div>
</div>

<!-- styles moved to subpage.css -->