<script>
  // @ts-nocheck

  // Version 0.4.1
  import { onMount, setContext } from 'svelte';
  import { fade } from 'svelte/transition';
  import { Component, Header } from '$lib/components';
  import { _ } from 'svelte-i18n';

  export let key = 'default-modal';
  /** @type {any} */
  export let header;
  export let closeButton = true;
  export let closeOnEsc = true;
  export let closeOnOuterClick = true;
  export let styleBg = { top: 0, left: 0 };
  export let styleWindow = {};
  export let styleContent = {};
  export let transitionBg = fade;
  export let transitionBgProps = { duration: 250 };
  export let transitionWindow = transitionBg;
  export let transitionWindowProps = transitionBgProps;

  const defaultState = {
    closeButton,
    closeOnEsc,
    closeOnOuterClick,
    styleBg,
    styleWindow,
    styleContent,
    transitionBg,
    transitionBgProps,
    transitionWindow,
    transitionWindowProps
  };
  let state = { ...defaultState };

  let _Component = null;
  let props = null;
  let commonProps = null;

  let background;
  let wrap;

  const camelCaseToDash = (str) => str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();

  const toCssString = (props) =>
    Object.keys(props).reduce((str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`, '');

  $: cssBg = toCssString(state.styleBg);
  $: cssWindow = toCssString(state.styleWindow);
  $: cssContent = toCssString(state.styleContent);
  $: currentTransitionBg = state.transitionBg;
  $: currentTransitionWindow = state.transitionWindow;

  const toVoid = () => {};

  let onOpen = toVoid;
  let onClose = toVoid;
  let onOpened = toVoid;
  let onClosed = toVoid;

  const open = (NewComponent, newProps = {}, options = {}, callback = {}) => {
    _Component = NewComponent;
    commonProps = newProps.commonProps || {};
    props = { ...newProps, ...commonProps };
    state = { ...defaultState, ...options };
    onOpen = callback.onOpen || toVoid;
    onClose = callback.onClose || toVoid;
    onOpened = callback.onOpened || toVoid;
    onClosed = callback.onClosed || toVoid;
  };

  const close = (callback = {}) => {
    onClose = callback.onClose || onClose;
    onClosed = callback.onClosed || onClosed;
    _Component = null;
    props = null;
  };

  const handleKeyup = (event) => {
    if (state.closeOnEsc && _Component && event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  };

  const handleOuterClick = (event) => {
    if (state.closeOnOuterClick && (event.target === background || event.target === wrap)) {
      event.preventDefault();
      close();
    }
  };

  function translateHeader() {
    return $_(header.name, { values: { ...commonProps } });
  }

  function _onOpened() {
    document.documentElement.classList.add('modal-open', `modal-open-${key}`);
    onOpen();
  }

  function _onClosed() {
    document.documentElement.classList.remove('modal-open', `modal-open-${key}`);
    onClose();
  }

  onMount(() => {});
  setContext(key, { open, close });
</script>

<svelte:window on:keyup={handleKeyup} />

{#if _Component}
  <div
    class="bg"
    on:keydown={() => {}}
    on:click={handleOuterClick}
    bind:this={background}
    transition:currentTransitionBg={state.transitionBgProps}
    style={cssBg}
  >
    <div class="window-wrap" bind:this={wrap}>
      <div
        class="window"
        transition:currentTransitionWindow={state.transitionWindowProps}
        on:introstart={onOpen}
        on:outrostart={onClose}
        on:introend={_onOpened}
        on:outroend={_onClosed}
        style={cssWindow}
      >
        {#if state.closeButton}<button on:click={close} class="close" />{/if}
        <Component variant="sm">
          <div slot="header">
            <Header mdc h="5" style="text-transform: uppercase">
              {typeof header === 'string' ? header : translateHeader()}
            </Header>
          </div>
          <div class="content" style={cssContent}>
            <svelte:component this={_Component} {...props} />
          </div>
        </Component>
      </div>
    </div>
  </div>
{/if}
<slot />

<style>
  * {
    box-sizing: border-box;
  }
  .bg {
    position: fixed;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.66);
  }
  .window-wrap {
    position: relative;
    margin: 2rem;
    max-height: 100%;
  }
  .window {
    position: relative;
    width: 40rem;
    max-width: 100%;
    max-height: 100%;
    margin: 2rem auto;
    color: inherit;
    border-radius: 0.2rem;
    background: white;
  }
  .content {
    position: relative;
    padding: 1rem;
    max-height: calc(100vh - 4rem);
    overflow: auto;
  }
  .close {
    display: block;
    box-sizing: border-box;
    position: absolute;
    z-index: 1000;
    top: 1rem;
    right: 1rem;
    margin: 0;
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    border: 0;
    color: var(--on-primary);
    border-radius: 1.5rem;
    background: var(--primary);
    box-shadow: 0 0 0 1px var(--on-primary);
    transition: transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1),
      background 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
    -webkit-appearance: none;
  }
  .close:before,
  .close:after {
    content: '';
    display: block;
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    width: 1rem;
    height: 1px;
    background: var(--on-primary);
    transform-origin: center;
    transition: height 0.2s cubic-bezier(0.25, 0.1, 0.25, 1),
      background 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
  }
  .close:before {
    -webkit-transform: translate(0, -50%) rotate(45deg);
    -moz-transform: translate(0, -50%) rotate(45deg);
    transform: translate(0, -50%) rotate(45deg);
    left: 0.25rem;
  }
  .close:after {
    -webkit-transform: translate(0, -50%) rotate(-45deg);
    -moz-transform: translate(0, -50%) rotate(-45deg);
    transform: translate(0, -50%) rotate(-45deg);
    left: 0.25rem;
  }
  .close:hover {
    color: var(--primary);
    background: var(--on-primary);
  }
  .close:hover:before,
  .close:hover:after {
    height: 2px;
    background: var(--primary);
  }
  .close:focus {
    border-color: #3399ff;
    box-shadow: 0 0 0 2px #3399ff;
  }
  .close:active {
    transform: scale(0.9);
  }
  .close:hover,
  .close:focus,
  .close:active {
    outline: none;
  }
</style>
