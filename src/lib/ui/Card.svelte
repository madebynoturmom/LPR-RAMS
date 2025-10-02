<script lang="ts">
  export let className: string = '';
  export let padding: string = '2.25rem';
</script>

<div class="card {className}" style="--card-padding: {padding}">
  <slot />
</div>

<style>
  .card{
    background: #ffffff;
    border-radius: 18px;
    box-shadow: 0 12px 36px rgba(2,6,23,0.08);
    border: 1px solid rgba(16,24,40,0.04);
    padding: var(--card-padding);
    width:100%;
    max-width: min(420px, 95vw);
    box-sizing: border-box;
    /* keep card from overflowing viewport; allow internal scrolling on very small screens */
    max-height: calc(100vh - 4rem);
    overflow: auto;
    margin: auto;
  }

  @media (max-width:520px){
    .card{margin:0;
    padding:1.2rem;
    border-radius:12px;
    max-width:min(420px,95vw)}
  }

  /* defensive: ensure no element inside the card can cause horizontal overflow */
  .card{
    /* ensure children don't push outside */
    overflow-wrap: anywhere;
  }

  :global(.card *){
    max-width:100%;
    box-sizing: border-box;
  }
</style>
