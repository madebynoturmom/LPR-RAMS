
<script lang="ts">
  export let data;
  let events = data?.events ?? [];

  // sample events for development preview
  const sampleEvents = [
    { type: 'login', userName: 'Admin User', details: 'Signed in to dashboard', time: '2025-10-03 09:12:00' },
    { type: 'guest_pass_issued', userName: 'Alice Johnson', details: 'Issued guest pass for plate ABC-123', time: '2025-10-03 10:01:00' },
    { type: 'vehicle_registered', userName: 'Bob Smith', details: 'Registered vehicle R123', time: '2025-10-02 14:32:00' },
    { type: 'resident_added', userName: 'Admin User', details: 'Added new resident John Doe', time: '2025-10-02 11:20:00' },
    { type: 'guard_assigned', userName: 'Admin User', details: 'Assigned guard to gate A', time: '2025-10-01 08:00:00' }
  ];

  const displayedEvents: any[] = (events && events.length > 0) ? events : (import.meta.env.DEV ? sampleEvents : []);

  // Filter state
  let searchQuery = '';
  let selectedType = 'all';

  // Get unique event types
  $: eventTypes = ['all', ...new Set(displayedEvents.map((e: any) => e.type))];

  // Filtered events
  $: filteredEvents = displayedEvents.filter((event: any) => {
    const matchesSearch = searchQuery === '' || 
      event.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.details?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || event.type === selectedType;
    return matchesSearch && matchesType;
  });

  function getEventIcon(type: string) {
    const icons = {
      login: '🔐',
      logout: '🚪',
      guest_pass_issued: '🎫',
      vehicle_registered: '🚗',
      resident_added: '👤',
      guard_assigned: '👮',
      food_delivery: '🍕',
      access_granted: '✅',
      access_denied: '❌',
      default: '📋'
    };
    return icons[type as keyof typeof icons] || icons.default;
  }

  function getEventColor(type: string) {
    const colors = {
      login: 'green',
      logout: 'gray',
      guest_pass_issued: 'blue',
      vehicle_registered: 'purple',
      resident_added: 'teal',
      guard_assigned: 'orange',
      food_delivery: 'yellow',
      access_granted: 'green',
      access_denied: 'red',
      default: 'gray'
    };
    return colors[type as keyof typeof colors] || colors.default;
  }

  function formatEventType(type: string) {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  function formatTimestamp(time: string) {
    try {
      const date = new Date(time);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (e) {
      return time;
    }
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="/admin/dashboard/subpage.css" />
  <link rel="stylesheet" href="/admin/dashboard/events/events.css" />
</svelte:head>

<div class="subpage-container">
  <div class="subpage-card">
    <div class="subpage-header">
      <div>
        <h2 class="subpage-title">Event Logs</h2>
        <p class="text-gray-500 mt-2 text-sm">
          Track all system activities and user actions
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="events-filters">
      <div class="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input 
          type="search" 
          placeholder="Search events..." 
          bind:value={searchQuery}
          class="search-input"
        />
      </div>
      
      <select bind:value={selectedType} class="filter-select">
        {#each eventTypes as type}
          <option value={type}>{type === 'all' ? 'All Events' : formatEventType(String(type))}</option>
        {/each}
      </select>
    </div>

    <!-- Event Count -->
    <div class="event-stats">
      <span class="event-count">{filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}</span>
    </div>

    <!-- Events List -->
    {#if filteredEvents.length > 0}
      <div class="events-list">
        {#each filteredEvents as event, i (i)}
          <div class="event-card {getEventColor(event.type)}">
            <div class="event-icon">
              {getEventIcon(event.type)}
            </div>
            <div class="event-content">
              <div class="event-header">
                <span class="event-type">{formatEventType(event.type)}</span>
                <span class="event-time">{formatTimestamp(event.time)}</span>
              </div>
              <div class="event-user">{event.userName}</div>
              <div class="event-details">{event.details}</div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p class="empty-text">No events found</p>
        <p class="empty-subtext">Try adjusting your search or filters</p>
      </div>
    {/if}
  </div>
</div>