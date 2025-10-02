declare module 'shadcn-svelte' {
  import { SvelteComponentTyped } from 'svelte';
  export class Button extends SvelteComponentTyped<{
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'default' | 'lg';
    class?: string;
  }> {}
  export default { Button };
}
