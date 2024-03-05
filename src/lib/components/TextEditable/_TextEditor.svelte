<script lang="ts" context="module">
  const editors: Set<Span> = new Set();
</script>

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import Span from './_Span.svelte';
  import { Meta } from '@smui/list';

  export let id: string | null | undefined;
  export let multiple = false;
  export { className as class };
  export let locked = false;

  const dispatch = createEventDispatcher();
  let selected: any;
  let className = '';
  let editable: HTMLSpanElement;
  let span: Span;
  let active = false;
  let dataValue: string;

  $: if (active) {
    selected = span;
    if (!multiple) {
      editors.forEach((editor) => editor !== span && editor.cancel());
    }
  }
  $: contenteditable = active;

  onMount(() => {
    editors.add(span);

    editable.addEventListener('keydown', (event) => keyListener(event));
    editable.addEventListener('click', (event) => cancelEvent(event));

    return () => {
      editors.delete(span);
    };
  });

  function cancelEditable() {
    active = false;
    if (selected === span) {
      editable.isContentEditable && (editable.innerText = dataValue);
    }
  }

  function saveEditable() {
    const value = stripHTMLTags(editable);
    active = false;
    if (dataValue === value) return;
    dispatch('save:editable', {
      id,
      value,
      onFailCallback: () => cancelEditable(),
      onSuccessCallback: () => (dataValue = value),
    });
  }

  function createEditable() {
    active = true;
    editable.focus();
    dataValue = editable.innerText;
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(editable);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  function cancelEvent(event: MouseEvent) {
    event.stopPropagation?.();
    event.preventDefault?.();
  }

  function stripHTMLTags(node: HTMLSpanElement) {
    return node.innerText
      .replace(/<(script|title|style).*?<\/(script|title|style) *?>/gi, '')
      .replace(/<br[ ]*\/?>/gi, ' ');
  }

  function keyListener(event: KeyboardEvent) {
    event.stopPropagation();

    if (event.key === 'Enter') {
      saveEditable();
    }
    if (event.key === 'Escape') {
      cancelEditable();
    }
  }
</script>

<Span {cancelEditable} bind:this={span} class={'text-editor'}>
  <span
    {id}
    bind:this={editable}
    on:keydown
    {contenteditable}
    class:active
    class:className
    tabindex="-1"
    data-value={dataValue}
    role="button"
  >
    <slot />
  </span>
  {#if !locked}
    {#if contenteditable}
      <span class="control-group">
        <Meta
          on:keydown
          on:click$preventDefault={cancelEditable}
          class="material-icons control meta">cancel</Meta
        >
        <Meta
          on:keydown
          on:click$preventDefault={saveEditable}
          class="material-icons control meta">save</Meta
        >
      </span>
    {:else}
      <Meta
        on:click$preventDefault={createEditable}
        class="material-icons control meta">edit</Meta
      >
    {/if}
  {:else}
    <Meta class="material-icons meta" aria-hidden="true">lock</Meta>
  {/if}
</Span>

<style>
  :global(.text-editor) {
    display: flex;
    justify-content: space-between;
    flex: 1 1 100%;
    pointer-events: none;
  }
  :global(.meta) {
    margin-right: 0;
    font-size: 1em;
    align-self: center;
  }
  .control-group {
    display: flex;
    align-self: center;
  }
  .control-group :global(.control:not(:last-child)) {
    padding-right: 10px;
  }
  :global(.control) {
    visibility: visible;
    cursor: pointer;
    pointer-events: all;
  }
  .active[contenteditable] {
    flex-basis: 55%;
    padding: 0.5em;
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: auto;
    text-overflow: clip;
    pointer-events: all;
    cursor: initial;
  }
</style>
