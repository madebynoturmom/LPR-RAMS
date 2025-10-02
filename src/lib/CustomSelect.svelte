<script lang="ts">
  import { onMount } from 'svelte';
  export let name: string = 'custom-select';
  type Option = { value: string | number; label: string };
  export let options: Option[] = [];
  export let placeholder: string = 'Select...';
  export let required: boolean = false;
  export let value: string|number = '';

  let open: boolean = false;
  let activeIndex: number = -1;
  let selected: Option | null = null;
  let control: HTMLElement | null = null;
  let listId = `cs-${Math.random().toString(36).slice(2,9)}`;
  const optionId = (i: number) => `${listId}-opt-${i}`;

  $: activeOptionId = activeIndex >= 0 ? optionId(activeIndex) : undefined;

  onMount(() => {
    if (value !== undefined && value !== null && value !== '') {
      selected = options.find(o => String(o.value) === String(value)) ?? null;
    }
  });

  function toggle(): void {
    open = !open;
    if (open) {
      activeIndex = options.findIndex((o) => String(o.value) === String(value));
      // focus first if nothing selected
      if (activeIndex < 0) activeIndex = 0;
    }
  }

  function close(): void {
    open = false;
    activeIndex = -1;
  }

  function choose(i: number): void {
    selected = options[i] ?? null;
    value = selected ? selected.value : '';
    // close after select
    open = false;
    activeIndex = -1;
    control?.focus();
  }

  function onKeydown(e: KeyboardEvent): void {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) { toggle(); return; }
      activeIndex = Math.min(activeIndex + 1, options.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) { toggle(); return; }
      if (activeIndex >= 0) choose(activeIndex);
    } else if (e.key === 'Escape') {
      close();
    }
  }
</script>

<div class="cs-wrapper">
  <!-- hidden input so native form submission works -->
  <input type="hidden" name={name} value={value} {required} />

  <button
    type="button"
    class="cs-control"
    role="combobox"
    aria-expanded={open}
    aria-haspopup="listbox"
    aria-controls={listId}
    aria-activedescendant={open ? activeOptionId : undefined}
    tabindex="0"
    on:click|stopPropagation={toggle}
    on:keydown={onKeydown}
    bind:this={control}
  >
    <div class="cs-value">{selected ? selected.label : placeholder}</div>
    <div class="cs-caret" aria-hidden="true">▾</div>
  </button>

  {#if open}
  <ul class="cs-list" role="listbox" id={listId}>
      {#each options as opt, i}
        <li>
          <button
            type="button"
            id={optionId(i)}
            role="option"
            class:active={i === activeIndex}
            aria-selected={selected && String(selected.value) === String(opt.value) ? 'true' : 'false'}
            tabindex="-1"
            on:click={() => choose(i)}
            on:mouseenter={() => { activeIndex = i; }}
          >
            {opt.label}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
.cs-wrapper { position: relative; width: 100%; }
.cs-control {
  display:flex; align-items:center; justify-content:space-between;
  gap:0.5rem; padding: 0.85rem 0.9rem; border-radius:8px; cursor:pointer;
  border: 1px solid var(--select-border, #cbd5e1); background: var(--select-bg, #fbfdff);
  box-shadow: none;
}
.cs-control:focus { outline: none; box-shadow: 0 4px 14px rgba(59,130,246,0.12); border-color: #3b82f6; }
.cs-value { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cs-caret { color: #9ca3af; margin-left: 0.5rem; }
.cs-list {
  position: absolute; left: 0; right: 0; z-index: 9999; margin-top: 0.35rem; list-style: none; padding: 0.25rem 0; border-radius: 6px;
  box-shadow: 0 10px 30px rgba(16,24,40,0.12); background: #fff; border: 1px solid rgba(0,0,0,0.08); max-height: 48vh; overflow: auto;
}
.cs-list li { padding: 0.6rem 0.9rem; cursor: pointer; }
.cs-list li { padding: 0; }
.cs-list li button { display:block; width:100%; text-align:left; padding: 0.6rem 0.9rem; cursor: pointer; border:none; background:transparent; }
.cs-list li button:hover, .cs-list li button.active { background: #f8fafc; }
.cs-list li button[aria-selected="true"] { font-weight: 700; }
</style>
