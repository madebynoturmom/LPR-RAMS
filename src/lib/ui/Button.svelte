<script lang="ts">
  import { button } from './button';
  import { cn } from './utils';

  export let variant: 'default' | 'outline' | 'ghost' = 'default';
  export let size: 'sm' | 'default' | 'lg' = 'default';
  export let className: string = '';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled: boolean = false;
</script>

<button class={cn(button({ variant, size }), className)} {type} {disabled}>
  <slot />
</button>
