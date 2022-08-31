<script>
  // @ts-nocheck

  import './_chip.scss';
  import { onMount } from 'svelte';
  import Chip, { Set, LeadingIcon, Text } from '@smui/chips';
  import Dot from './_Dot.svelte';
  import { session } from '$app/stores';
  import { ticker } from '$lib/stores';
  import { _ } from 'svelte-i18n';

  export let prefix = '';
  export { className as class };
  export let warning = 60;
  export let warningOnly = false;
  export let forceOnExtend = 5;

  const FAILS = 2;

  let className = '',
    last,
    timeout,
    fails = FAILS,
    forced = false,
    forceTime = forceOnExtend * 1000 || 6000;

  prefix === true && (prefix = '');

  $: clName = !isNaN(warning) && $ticker / 1000 <= warning ? 'warning' : className;
  $: isWarning = clName === 'warning';
  $: isVisible = !warningOnly || isWarning;
  $: indefinite = fails < FAILS;
  $: show = isVisible || forced;

  onMount(() => {
    if (forceOnExtend) {
      window.addEventListener('ticker:extend', forceVisible);
      forceVisible();
    }

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('ticker:extend', forceVisible);
    };
  });

  Number.prototype.minDigits = function (minimumIntegerDigits, locale = 'de-DE', options) {
    return this.toLocaleString(locale, {
      minimumIntegerDigits,
      ...options
    });
  };

  function parse(ms) {
    let tt, sec, min, hrs;
    if (isNaN(ms)) {
      return (--fails && last) || '--:--:--';
    }
    fails = FAILS;
    tt = ms / 1000;
    sec = Math.floor(tt % 60).minDigits(2);
    min = Math.floor((tt / 60) % 60).minDigits(2);
    hrs = Math.floor(tt / 3600).minDigits(2);
    return (last = `${hrs}:${min}:${sec}`);
  }

  function forceVisible() {
    forced = true;
    clearTimeout(timeout);
    timeout = setTimeout(() => (forced = false), forceTime);
  }
</script>

{#if $session.user}
  <div class="container" class:show class:isWarning>
    <Set chips={[{ id: 0 }]} let:chip>
      <Chip class={clName} on:MDCChip:interaction {chip}>
        <LeadingIcon class="material-icons" leading>av_timer</LeadingIcon>
        <Text>
          <span>{prefix && $_(prefix)}</span>
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
    opacity: 1;
    transition: opacity 0.15s ease-in;
  }
  .container.show.isWarning {
    opacity: 1;
  }
</style>
