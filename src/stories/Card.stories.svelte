<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Card from '../lib/ui/Card.svelte';

  defineMeta({ title: 'Example/Card', component: Card });
</script>

<script>
  import './page.css';
</script>

<Card padding="2rem" className="storybook-card">
  <h3 style="margin:0 0 .5rem">Card Title</h3>
  <p style="margin:0;color:#475569">This is a reusable Card component used across the app.</p>
</Card>
