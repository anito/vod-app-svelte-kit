<script lang="ts">
  import './_chip.scss';
  import Chip, { Set, LeadingIcon, Text } from '@smui/chips';
  import { session, ticker } from '$lib/stores';
  import { _ } from 'svelte-i18n';

  export { className as class };
  export let signalType = 'primary';
  export let leadTime = 60; // lead time (before zero) when signaling takes effect
  export let signalOnly = false;

  const Fails = 2;

  let className = '';
  let last: string;
  let timeoutId: ReturnType<typeof setTimeout>;
  let fails = Fails;
  let forced = false;
  let fadeoutTimeMs = 2000;

  $: chipClassName = $ticker / (60 * 1000) <= leadTime ? signalType : '';
  $: signal = chipClassName === signalType;
  $: isVisible = !signalOnly || signal;
  $: $session._expires && forceVisible();
  $: show = isVisible || forced;

  function parse(ms: number) {
    let tt, sec, min, hrs, dys;
    if (isNaN(ms)) {
      return (--fails && last) || '--:--:--';
    }
    fails = Fails;
    tt = ms / 1000;
    sec = Math.floor(tt % 60).minimumIntegerDigits(2);
    min = Math.floor((tt / 60) % 60).minimumIntegerDigits(2);
    hrs = Math.floor((tt / (60 * 60)) % 24).minimumIntegerDigits(2);
    dys = Math.floor(tt / (60 * 60 * 24)).minimumIntegerDigits(2);

    const days = (days: number) =>
      days
        ? days === 1
          ? `${days} ${$_('Day')} `
          : `${days} ${$_('Days')} `
        : '';
    return (last = `${days(parseFloat(dys))}${hrs}:${min}:${sec}`);
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
        <LeadingIcon class="material-icons">av_timer</LeadingIcon>
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
