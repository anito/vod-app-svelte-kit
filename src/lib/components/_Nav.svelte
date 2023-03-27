<script lang="ts">
  import { getContext, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { streams } from '$lib/stores';

  export let segment: string;
  export let page;
  export let logo: string;
  export let home = 'Home';
  export let home_title = 'Homepage';

  const showHome = true;
  const current = writable();
  setContext('nav', current);

  const { getProgress }: any = getContext('progress');
  const progress = getProgress();
  $: progrssbarWidth = $progress;
  $: $current = segment;

  let open = false;
  let visible = true;

  // hide nav whenever we navigate
  page.subscribe(() => {
    open = false;
  });

  function intercept_touchstart(event: TouchEvent) {
    if (!open) {
      event.preventDefault();
      event.stopPropagation();
      open = true;
    }
  }

  // Prevents navbar to show/hide when clicking in docs sidebar
  let hash_changed = false;
  function handle_hashchange() {
    hash_changed = true;
  }

  let last_scroll = 0;
  function handle_scroll() {
    const scroll = window.pageYOffset;
    if (!hash_changed) {
      visible = scroll < 50 || scroll < last_scroll;
    }

    last_scroll = scroll;
    hash_changed = false;
  }
</script>

<svelte:window on:hashchange={handle_hashchange} on:scroll={handle_scroll} />

<header class:visible={visible || open} style:--progressbar-w="{progrssbarWidth}vw">
  <nav>
    <a href="/" class="home" title={home_title} style="background-image: url('{logo}')">{home}</a>

    {#if open}
      <div
        class="modal-background hide-if-desktop"
        on:keydown={() => {}}
        on:click={() => (open = false)}
      />
    {/if}

    <ul
      class="primary"
      class:open
      on:touchstart|capture={intercept_touchstart}
      on:mouseenter={() => (open = true)}
      on:mouseleave={() => (open = false)}
    >
      <li class:hide-if-desktop={!showHome} class:active={segment === 'home'} class="nav-item">
        <a href="/">{home}</a>
      </li>
      <slot />
    </ul>
  </nav>
</header>

<style>
  header {
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100vw;
    height: var(--nav-h);
    padding: 0 var(--side-nav);
    margin: 0 auto;
    background-color: var(--surface);
    box-shadow: 0 -0.4rem 0.9rem 0.2rem rgba(0, 0, 0, 0.5);
    font-family: var(--font);
    z-index: 100;
    user-select: none;
    transform: translate(0, calc(-100% - 1rem));
    transition: transform 0.2s;
    color: inherit;
  }

  header::before,
  header::after {
    --progressbar-h: 3px;
  }
  header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: var(--progressbar-h);
    background: var(--primary);
    z-index: 1;
  }
  header::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: var(--progressbar-w, 100vw);
    height: var(--progressbar-h);
    background: var(--secondary);
    transition: all ease-out 1s;
    z-index: 2;
  }

  header.visible {
    transform: none;
  }

  nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: var(--nav-h);
    padding: 0 var(--side-nav);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: transparent;
    transform: none;
    transition: none;
    box-shadow: none;
  }

  .primary {
    list-style: none;
    font-family: var(--font);
    margin: 0;
    line-height: 1;
  }

  .primary :global(li.nav-item) {
    display: block;
    display: none;
  }

  .primary :global(li.nav-item.active) {
    display: block;
  }

  .primary {
    position: relative;
    pointer-events: none;
    padding: 0 3rem 0 0;
    background: url(/src/assets/icons/chevron.svg) calc(100% - 1em) 0.05em no-repeat;
    background-size: 1em 1em;
  }

  .primary::after {
    /* prevent clicks from registering if nav is closed */
    position: absolute;
    content: '';
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }

  .primary.open::after {
    display: none;
  }

  .primary > :global(li.nav-item) {
    pointer-events: all;
  }

  .primary > :global(li.nav-item a),
  .primary > :global(li.nav-item .link-button),
  .primary > :global(li.nav-item [class*='label']) {
    font-size: var(--label-size, 1.1em);
    font-weight: 600;
    border: none;
    color: inherit;
    display: inline-block;
  }

  .primary > :global(li.nav-item > a),
  .primary > :global(li.nav-item > span) {
    display: inline-block;
    vertical-align: -webkit-baseline-middle;
    vertical-align: baseline;
    line-height: 1em;
    padding: 0 0.7rem;
    min-width: 40px;
  }

  .primary :global(svg) {
    width: var(--icon-size, 1.25rem);
    height: var(--icon-size, 1.25rem);
  }

  .home {
    position: relative;
    top: -0.1rem;
    width: 2.6rem;
    height: 2.925rem;
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    background: 0 50% no-repeat;
    background-size: auto 100%;
    text-indent: -9999px;
    /* z-index: 11; */
  }

  .primary > :global(li.nav-item.active a) {
    color: var(--primary);
  }

  .modal-background {
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    background-color: rgba(255, 255, 255, 0.9);
  }

  a {
    color: inherit;
    border-bottom: none;
    transition: none;
  }

  .primary > :global(li.nav-item):not(.active) :global(a):hover,
  .primary > :global(li.nav-item):not(.active) :global(.link-button):hover {
    color: var(--flash);
  }

  @media (max-width: 990px) {
    .primary.open {
      padding: 0 0 1em 0;
      background: white;
      border-left: 1px solid #eee;
      border-right: 1px solid #eee;
      border-bottom: 1px solid #eee;
      border-radius: 0 0 var(--border-r) var(--border-r);
      align-self: start;
    }

    .primary.open > :global(li.nav-item) {
      display: block;
      text-align: right;
    }

    .primary.open > :global(li.nav-item a) {
      padding: 0.9375rem 2.3125rem 0.9375rem 2.5rem;
      display: block;
    }

    .primary.open > :global(li.nav-item):first-child :global(a) {
      padding-top: 1.4375rem;
    }

    :global(.hide-if-mobile) {
      display: none !important;
    }
  }

  @media (min-width: 991px) {
    .primary {
      display: flex;
      align-items: center;
      padding: 0;
      background: none;
    }

    /* .primary.open {
      padding: 0;
      background: transparent;
      border: none;
      align-self: initial;
    }

    .primary.open > :global(li.nav-item) {
      display: inline;
      text-align: left;
    }

    .primary.open > :global(li.nav-item a) {
      font-size: var(--h4);
      padding: 0 0.7rem;
    }

    .primary.open > :global(li.nav-item):first-child :global(a) {
      padding-top: 0;
    } */

    .primary::after {
      display: none;
    }

    .primary :global(li.nav-item) {
      display: inline;
      padding-left: 5px;
    }

    :global(.hide-if-desktop) {
      display: none !important;
    }
  }
</style>
