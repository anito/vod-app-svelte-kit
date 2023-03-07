<script lang="ts">
  import { navigating } from '$app/stores';
  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { convert } from '$lib/utils';
  import type { NavigationTarget } from '@sveltejs/kit';
  import { DoubleBounce } from 'svelte-loading-spinners';

  export let wait = 500;
  export let backgroundColor = '#222222';
  export let opacity = 0.5;

  const SEARCHES_KEY = 'searches';
  const PATHS_KEY = 'paths';

  /**
   * Configure where to supress the LoadinSpinner
   * - Configure url query names which shall supress the LoadinSpinner
   */
  const searches = ['active'];
  /**
   * - Configure pathnames which shall supress the LoadinSpinner
   */
  const pathnames: string[] = [];

  let root: HTMLElement;
  let timeoutId: number | undefined;

  let disabled = false;
  const omitt = new Map([
    [
      SEARCHES_KEY,
      (to: NavigationTarget) => {
        searches.forEach((slug) => {
          if (to.url.searchParams.has(slug)) {
            disabled = true;
          }
        });
      }
    ],
    [
      PATHS_KEY,
      (to) => {
        pathnames.forEach((slug) => {
          if (to.url.pathname.indexOf(slug) != -1) {
            disabled = true;
          }
        });
      }
    ]
  ]);

  beforeNavigate(({ to }) => {
    root?.classList.remove('navigating');
    disabled = false;
    omitt.forEach((fn, key) => {
      key === SEARCHES_KEY && to && fn(to);
      key === PATHS_KEY && to && fn(to);
    });
  });

  afterNavigate(() => (disabled = false));

  onMount(() => {
    root = document.documentElement;
  });

  $: !disabled &&
    ((isNavigating) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => root?.classList.toggle('navigating', isNavigating), wait);
    })(!!$navigating);
  $: _step1 = backgroundColor.slice(0, 7);
  $: bgColor = `${_step1}${(_step1.length === 7 && opacityToHex) || ''}`;
  $: opacityToHex = convert.dec2Hex(opacity, true);
</script>

<div class="modal-outer" style="background-color: {bgColor}">
  <div class="modal-inner">
    <slot />
  </div>
</div>

<style>
  .modal-outer {
    position: fixed;
    z-index: -9999999;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    opacity: 0;
    transition: opacity 0.3s ease-out;
  }
  :global(.navigating) .modal-outer {
    opacity: 1;
    transition: opacity 0.3s;
    transition-timing-function: ease-in;
    z-index: 9999999;
  }
  .modal-inner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
