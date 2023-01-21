<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import { fade } from 'svelte/transition';
  import { Container, Header } from '$lib/components';
  import { _ } from 'svelte-i18n';

  export let key = 'default-modal';
  export let header: any;
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

  let HostedComponent: any = null;
  let props: any = null;
  let layoutProps: any = null;

  let background: Element | null | undefined;
  let wrap: Element;

  const camelCaseToDash = (str: string) => str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();

  const toCssString = (props: { [x: string]: any; top?: number; left?: number }) =>
    Object.keys(props).reduce((str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`, '');

  $: cssBg = toCssString(state.styleBg);
  $: cssWindow = toCssString(state.styleWindow);
  $: cssContent = toCssString(state.styleContent);
  $: currentTransitionBg = state.transitionBg;
  $: currentTransitionWindow = state.transitionWindow;

  const toVoid = () => {};
  const toTrue = () => true;
  const toFalse = () => false;
  const doClose = { beforeClose: () => true };

  let onOpen = toVoid;
  let onClose = toVoid;
  let onOpened = toVoid;
  let onClosed = toVoid;
  let beforeClose = toTrue;
  // let beforeClose = toFalse;

  const open = (
    NewComponent: any,
    newProps = { layoutProps },
    options = {},
    callback = { beforeClose, onOpen, onOpened, onClose, onClosed }
  ) => {
    HostedComponent = NewComponent;
    layoutProps = { ...newProps.layoutProps } || {};
    props = { ...newProps };
    state = { ...defaultState, ...options };
    onOpen = callback.onOpen || toVoid;
    onClose = callback.onClose || toVoid;
    onOpened = callback.onOpened || toVoid;
    onClosed = callback.onClosed || toVoid;
    beforeClose = callback.beforeClose || toTrue;
  };

  const close = (
    callback:
      | { beforeClose: () => boolean; onClose?: () => void; onClosed?: () => void }
      | undefined = { beforeClose }
  ) => {
    const canClose = typeof callback?.beforeClose === 'function' ? callback?.beforeClose() : true;
    if (canClose) {
      onClose = callback?.onClose || onClose;
      onClosed = callback?.onClosed || onClosed;
      HostedComponent = null;
      props = null;
    }
  };

  const handleKeyup = (event: { key: string; preventDefault: () => void }) => {
    if (state.closeOnEsc && HostedComponent && event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  };

  const handleClose = () => {
    close();
  };

  const handleOuterClick = (event?: {
    target: EventTarget | null | undefined;
    preventDefault: () => void;
  }) => {
    if (state.closeOnOuterClick && (event?.target === background || event?.target === wrap)) {
      event?.preventDefault();
      close();
    }
  };

  function translateHeader() {
    return $_(header.name, { values: { ...layoutProps } });
  }

  function _onOpened() {
    document.documentElement.classList.add('modal-open', `modal-open-${key}`);
    onOpened();
  }

  function _onClosed() {
    document.documentElement.classList.remove('modal-open', `modal-open-${key}`);
    onClosed();
  }

  onMount(() => {});
  setContext(key, { open, close });
</script>

<svelte:window on:keyup={handleKeyup} />

{#if HostedComponent}
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
        {#if state.closeButton}<button on:click={handleClose} class="button-close" />{/if}
        <Container density="sm" borderShape="medium">
          <div slot="header">
            <Header mdc h="5" style="text-transform: uppercase">
              {typeof header === 'string' ? header : translateHeader()}
            </Header>
          </div>
          <div class="content" style={cssContent}>
            <svelte:component this={HostedComponent} {...props} />
          </div>
        </Container>
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
  }
  .content {
    position: relative;
    padding: 1rem;
    max-height: calc(100vh - 16rem);
    background-color: var(--background-intense);
    border-bottom-right-radius: var(--border-radius, 4px);
    border-bottom-left-radius: var(--border-radius, 4px);
  }
</style>
