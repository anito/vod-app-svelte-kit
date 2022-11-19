<script>
  import './_chip.scss';
  import { onMount } from 'svelte';
  import Chip, { Set, LeadingIcon, Text } from '@smui/chips';
  import Dot from './_Dot.svelte';
  import { session, ticker } from '$lib/stores';
  import { _ } from 'svelte-i18n';

  export { className as class };
  export let warning = 60;
  export let warningOnly = false;
  export let forceOnExtend = 5;

  const FAILS = 2;

  let className = '';
  /** @type {string} */
  let last;
  /** @type {ReturnType<typeof setTimeout>} */
  let timeoutId;
  let fails = FAILS;
  let forced = false;
  let forceTime = forceOnExtend * 1000 || 6000;

  $: clName = !isNaN(warning) && $ticker / 1000 <= warning ? 'warning' : className;
  $: isWarning = clName === 'warning';
  $: isVisible = !warningOnly || isWarning;
  $: indefinite = fails < FAILS;
  $: show = isVisible || forced;

  onMount(() => {
    if (forceOnExtend) {
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
    fails = FAILS;
    tt = ms / 1000;
    // @ts-ignore
    sec = Math.floor(tt % 60).minDigits(2);
    // @ts-ignore
    min = Math.floor((tt / 60) % 60).minDigits(2);
    // @ts-ignore
    hrs = Math.floor(tt / 3600).minDigits(2);
    return (last = `${hrs}:${min}:${sec}`);
  }

  function forceVisible() {
    forced = true;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => (forced = false), forceTime);
  }
</script>

{#if $session.user}
  <div class="container" class:show class:isWarning>
    <Set chips={[{ id: 0 }]} let:chip>
      <Chip class={clName} on:MDCChip:interaction {chip}>
        <LeadingIcon class="material-icons" leading>av_timer</LeadingIcon>
        <Text>
          <span class="mr-1">
            {parse($ticker)}
          </span>
          <span class="no-tick-indicator">
            <Dot size={indefinite ? 4 : 0} color="alt" />
          </span>
        </Text>
      </Chip>
    </Set>
  </div>
{/if}

<style>
  .no-tick-indicator {
    display: inline-block;
    width: 4px;
    margin: auto 0;
    margin-right: 0px;
    margin-left: -3px;
  }
  .container {
    opacity: 0.3;
    transition: opacity 1s ease-out;
  }
  .container.show {
    opacity: 0.7;
    transition: opacity 0.4s ease-in;
  }
  .container.show.isWarning {
    transition: opacity 0.4s ease-in;
    opacity: 1;
  }
</style>
