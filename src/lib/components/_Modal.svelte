<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import { fade } from 'svelte/transition';
  import { Container, Heading } from '$lib/components';
  import { _ } from 'svelte-i18n';

  type Events = {
      beforeClose: () => boolean;
      onOpen: () => void;
      onClose: () => void;
      onOpened: () => void;
      onClosed: () => void;
    };
  type Config = {
    props?: any;
    headerProps?: any;
    options?: any;
    events?: Events;
  }

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

  const toVoid = () => {};
  const toTrue = () => true;
  const empty = {};

  let onOpen = toVoid;
  let onClose = toVoid;
  let onOpened = toVoid;
  let onClosed = toVoid;
  let beforeClose = toTrue;

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
  const defaultEvents: Events = {onClose, onClosed, onOpen, onOpened, beforeClose};

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

  let HostedComponent: any = null;
  let state = { ...defaultState };
  let events = {...defaultEvents};
  let props: any;
  let headerProps: any;

  const open = (
    NewComponent: any,
    config: Config = {}
  ) => {
    HostedComponent = NewComponent;
    props = { ...config.props };
    headerProps = { ...config.headerProps };
    state = { ...defaultState, ...config.options };
    events = { ...defaultEvents, ...config.events};
    onOpen = events.onOpen;
    onClose = events.onClose;
    onOpened = events.onOpened;
    onClosed = events.onClosed;
    beforeClose = events.beforeClose;
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
    return $_(header.name, { values: { ...headerProps } });
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
    tabindex="0"
    role="button"
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
        <Container density="sm" borderShape="medium" contentBackgroundColor={"var(--background)"}>
          <div slot="header">
            <Heading mdc h="5" style="text-transform: uppercase">
              {typeof header === 'string' ? header : translateHeader()}
            </Heading>
          </div>
          <div style={cssContent}>
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
