<script lang="ts">
  import { getContext } from 'svelte';
  import Section from './Section.svelte';
  import { Container, Heading } from '$lib/components';

  const { getProgress }: any = getContext('progress');
  const progress = getProgress();
  $: progressbarWidth = $progress;
</script>

<Section>
  <div class="" style:--progressbar-w="{progressbarWidth}%">
    <Container
      density="sm"
      variant="primary"
      contentBackgroundColor="var(--surface)"
      borderShape="medium"
      headerClass="progressbar-anchor"
    >
      <header class="header" slot="header">
        <Heading mdc h="5">Take control over the loading process with ReadableStream</Heading>
      </header>
      <div class="subheader" style="font-size: .8em; margin: 20px 15px; line-height: 1em;">
        <a
          href="https://stackblitz.com/edit/readablestream?file=src%2Froutes%2F%2Bpage.svelte"
          target="_blank"
          rel="noreferrer">See also live example on Stackblitz</a
        >
        or view on
        <a target="_blank" rel="noreferrer" href="https://github.com/anito/readablestream">GitHub</a
        >
      </div>
      <div class="blurb">
        <div class="box one">
          <slot name="one" />
        </div>

        <div class="box two">
          <slot name="two" />
        </div>

        <div class="box three">
          <slot name="three" />
        </div>

        <div class="box fore">
          <slot name="fore" />
        </div>
      </div>
    </Container>
  </div>
</Section>

<style>
  .blurb {
    display: grid;
    grid-row-gap: 1em;
    grid-template-areas:
      'one'
      'two'
      'three'
      'fore';
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

  :global(.progressbar-anchor) {
    position: relative !important;
  }
  :global(.progressbar-anchor)::before,
  :global(.progressbar-anchor)::after {
    --progressbar-h: 3px;
  }
  :global(.progressbar-anchor)::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: var(--progressbar-h);
    background: var(--primary);
    z-index: 1;
  }
  :global(.progressbar-anchor)::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: var(--progressbar-w, 100%);
    height: var(--progressbar-h);
    background: var(--secondary);
    transition: all ease-out 1s;
    z-index: 2;
  }

  @media (min-width: 991px) {
    .blurb {
      grid-column-gap: 1em;
      grid-row-gap: 1em;
      grid-template-columns: repeat(2, 1fr);
      grid-template-areas:
        'one two'
        'three fore';
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
      grid-template-areas:
        'one two'
        'three fore';
    }

    .blurb .box :gloabl(.cta) {
      text-align: left;
    }
  }
</style>
