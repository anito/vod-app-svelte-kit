<script>
  import Section from './Section.svelte';
  import { Component, Header } from '$lib/components';
</script>

<Section>
  <Component density="sm" variant="primary" contentBackgroundColor="var(--surface)">
    <div slot="header">
      <Header mdc h="5">ReadableStream - Loading Ressources w/o Blocking</Header>
    </div>
    <a
      style="font-size: .8em; margin: 0 15px; line-height: 1em;"
      href="https://stackblitz.com/edit/readablestream?file=src%2Froutes%2F%2Bpage.svelte"
      target="_blank"
      rel="noreferrer">For more details see source on Stackblitz</a
    >
    <div class="blurb">
      <div class="box">
        <slot name="one" />
      </div>

      <div class="box">
        <slot name="two" />
      </div>
    </div>
  </Component>
</Section>

<style>
  .blurb {
    display: grid;
    grid-row-gap: 1em;
    grid-template-areas:
      'one'
      'two';
  }
  .box {
    padding: 1em;
    display: flex;
    flex-direction: column;
    border-bottom: none;
  }

  .box :global(a) {
    color: white;
    padding: 0;
    border: none;
  }

  .box :global(p) {
    color: white;
  }

  .box:global(h2) {
    padding: 0;
    margin: 0 0 0.5em 0;
    font-size: var(--h2);
    color: white;
    text-align: left;
  }

  .box :gloabl(.learn-more) {
    display: block;
    position: relative;
    text-align: right;
    margin-top: auto;
    padding: 0 1.2em 0 0;
  }

  .box:hover :global(.learn-more) {
    color: white;
    text-decoration: underline;
  }

  .box :gloabl(.learn-more::after),
  .box :gloabl(.cta a::after) {
    content: '';
    position: absolute;
    display: block;
    right: 0;
    top: 0.3em;
    width: 1em;
    height: 1em;
    background: url(/src/assets/icons/arrow-right.svg);
    background-size: 100% 100%;
  }

  :global(p),
  :gloabl(a) {
    font-size: var(--h5);
  }

  @media (min-width: 991px) {
    .blurb {
      grid-column-gap: 1em;
      grid-row-gap: 1em;
      grid-template-columns: repeat(2, 1fr);
      grid-template-areas: 'one two';
    }
    .blurb .box {
      padding: 2em;
    }
    .blurb .box :gloabl(.cta) {
      text-align: right;
    }
  }

  @media (min-width: 1200px) {
    .blurb {
      grid-column-gap: 1em;
      grid-row-gap: 5em;
      grid-template-columns: repeat(2, 1fr);
      grid-template-areas: 'one two';
    }

    .blurb .box :gloabl(.cta) {
      text-align: left;
    }
  }
</style>
