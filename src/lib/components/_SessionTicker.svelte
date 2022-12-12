<script>
  import './_chip.scss';
  import { onMount } from 'svelte';
  import Chip, { Set, LeadingIcon, Text } from '@smui/chips';
  import { session, ticker } from '$lib/stores';
  import { _ } from 'svelte-i18n';

  export { className as class };
  export let signalType = 'primary';
  export let leadTime = 60; // lead time (before zero) when signaling takes effect
  export let signalOnly = false;

  const Fails = 2;

  /** @type {string} */
  let className = '';
  /** @type {string} */
  let last;
  /** @type {ReturnType<typeof setTimeout>} */
  let timeoutId;
  /** @type {number} */
  let fails = Fails;
  /** @type {boolean} */
  let forced = false;
  /** @type {number} */
  let fadeoutTimeMs = 2000;

  $: chipClassName = $ticker / (60 * 1000) <= leadTime ? signalType : '';
  $: signal = chipClassName === signalType;
  $: isVisible = !signalOnly || signal;
  $: show = isVisible || forced;

  onMount(() => {
    if (fadeoutTimeMs) {
      window.addEventListener('session:extend', forceVisible);
      forceVisible();
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('session:extend', forceVisible);
    };
  });

  /**
   *
   * @param {number} ms
   * @returns {string}
   */
  function parse(ms) {
    let tt, sec, min, hrs;
    if (isNaN(ms)) {
      return (--fails && last) || '--:--:--';
    }
    fails = Fails;
    tt = ms / 1000;
    sec = Math.floor(tt % 60).minDigits(2);
    min = Math.floor((tt / 60) % 60).minDigits(2);
    hrs = Math.floor(tt / 3600).minDigits(2);
    return (last = `${hrs}:${min}:${sec}`);
  }

  function forceVisible() {
    forced = true;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => (forced = false), fadeoutTimeMs);
  }
</script>

{#if $session.user}
  <div class="container {className}" class:show class:signal>
    <Set chips={[{ id: 0 }]} let:chip class="info" on:MDCChip:interaction>
      <Chip class={chipClassName} {chip}>
        <LeadingIcon class="material-icons" leading>av_timer</LeadingIcon>
        <Text>
          <span class="mr-1">
            {parse($ticker)}
          </span>
        </Text>
      </Chip>
    </Set>
  </div>
{/if}

<style>
  .container {
    opacity: 0.3;
    transition: opacity 1s ease-out;
  }
  .container.show {
    opacity: 0.7;
    transition: opacity 0.4s ease-in;
  }
  .container.show.signal {
    transition: opacity 0.4s ease-in;
    opacity: 1;
  }
</style>
