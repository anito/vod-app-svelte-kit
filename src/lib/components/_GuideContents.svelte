<script lang="ts">
    import type { Section } from '$lib/types';
  import { afterUpdate } from 'svelte';
  import SvgIcon from './_SvgIcon.svelte';

  

  export let sections: Section[] = [];
  export let active_section: string | null = null;
  export let show_contents: boolean;
  export let prevent_sidebar_scroll = false;

  let ul: HTMLUListElement;

  afterUpdate(() => {
    // bit of a hack — prevent sidebar scrolling if
    // TOC is open on mobile, or scroll came from within sidebar
    if (prevent_sidebar_scroll || (show_contents && window.innerWidth < 832)) return;

    const active = ul.querySelector('.active');

    if (active) {
      const { top, bottom } = active.getBoundingClientRect();

      const min = 200;
      const max = window.innerHeight - 200;
      const parentNode = ul.parentNode as Element

      if (top > max) {
        parentNode?.scrollBy({
          top: top - max,
          left: 0,
          behavior: 'smooth'
        });
      } else if (bottom < min) {
        parentNode?.scrollBy({
          top: bottom - min,
          left: 0,
          behavior: 'smooth'
        });
      }
    }
  });
</script>

<ul
  bind:this={ul}
  class="reference-toc"
  on:mouseenter={() => (prevent_sidebar_scroll = true)}
  on:mouseleave={() => (prevent_sidebar_scroll = false)}
>
  {#each sections as section}
    <li>
      <a class="section" class:active={section.slug === active_section} href="docs#{section.slug}">
        {@html section.metadata.title}

        {#if section.slug === active_section}
          <div class="icon-container">
            <SvgIcon name="arrow-right" />
          </div>
        {/if}
      </a>

      {#each section.subsections as subsection}
        <!-- see <script> below: on:click='scrollTo(event, subsection.slug)' -->
        <a
          class="subsection"
          class:active={subsection.slug === active_section}
          href="docs#{subsection.slug}"
          data-level={subsection.level}
        >
          {@html subsection.title}

          {#if subsection.slug === active_section}
            <div class="icon-container">
              <SvgIcon name="arrow-right" />
            </div>
          {/if}
        </a>
      {/each}
    </li>
  {/each}
</ul>

<style>
  .reference-toc li {
    display: block;
    line-height: 1.2;
    margin: 0 0 4rem 0;
  }

  a {
    position: relative;
    transition: color 0.2s;
    border-bottom: none;
    padding: 0;
    color: var(--secondary);
  }

  .section {
    display: block;
    padding: 0 0 0.8rem 0;
    font-size: var(--h6);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
  }

  .subsection {
    display: block;
    font-size: 1.6rem;
    font-family: var(--font);
    padding: 0 0 0.6em 0;
  }

  .section:hover,
  .subsection:hover,
  .active {
    color: var(--flash);
  }

  .subsection[data-level='4'] {
    padding-left: 1.2rem;
  }

  .icon-container {
    position: absolute;
    top: -0.2rem;
    right: 2.4rem;
  }

  @media (min-width: 832px) {
    a {
      color: var(--sidebar-text);
    }

    a:hover,
    .section:hover,
    .subsection:hover,
    .active {
      color: white;
    }
  }
</style>
