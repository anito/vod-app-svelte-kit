<script lang="ts">
  import Section from './_Section.svelte';

  export { className as class };

  let className = '';
</script>

<Section class={className}>
  <div class="blurb">
    <div class="box primary">
      <slot name="one" />
    </div>

    <div class="box flash">
      <slot name="two" />
    </div>

    <div class="what">
      <slot name="what" />
    </div>

    <div class="how">
      <slot name="how" />
    </div>
  </div>
</Section>

<style lang="scss">
  :global(.dark) .blurb .box {
    --opacity: 0.75;
  }
  .blurb {
    display: grid;
    grid-row-gap: 1em;
    grid-template-areas:
      'one'
      'two'
      'three'
      'what'
      'how';

    .box {
      --blur: blur(2.5px);
      --saturate: saturate(180%);
      --opacity: 1;
      padding: 1em;
      display: flex;
      flex-direction: column;
      border-width: 0;
      background-color: var(--color);
      border-color: var(--color);
      -webkit-backdrop-filter: var(--saturate) var(--blur);
      backdrop-filter: var(--saturate) var(--blur);

      &.primary {
        --color: rgb(40 158 255 / var(--opacity));
        color: var(--on-primary);
        grid-area: one;
      }
      &.flash {
        --color: rgb(174 20 87 / var(--opacity));
        color: white;
        grid-area: two / two;
      }

      :global(a) {
        color: white;
        padding: 0;
        border: none;
      }

      :global(p) {
        color: white;
      }

      :global(h2) {
        padding: 0;
        margin: 0 0 0.5em 0;
        font-size: var(--h2);
        color: white;
        text-align: left;
      }

      :gloabl(.learn-more) {
        display: block;
        position: relative;
        text-align: right;
        margin-top: auto;
        padding: 0 1.2em 0 0;
      }

      :hover :global(.learn-more) {
        color: white;
        text-decoration: underline;
      }

      :gloabl(.learn-more::after),
      :gloabl(.cta a::after) {
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
    }

    :global(p),
    :gloabl(a) {
      font-size: var(--h5);
    }

    .how {
      /* needed to prevent the <pre> from
		   breaking the grid layout */
      min-width: 0;
      grid-area: how;

      :gloabl(.cta) {
        margin: 0;

        :gloabl(a) {
          display: inline-block;
          text-align: right;
          background-color: var(--primary);
          padding: 0.5em 1.8em 0.5em 1em;
          border-radius: var(--border-r);
          border: none;
          color: var(--on-primary);
          position: relative;

          &:gloabl(::after) {
            right: 0.5em;
            top: 0.75em;
          }
        }
      }
    }

    .what {
      grid-area: what;
      margin: 2em 0 0 0;
    }
  }

  @media (min-width: 991px) {
    .blurb {
      grid-column-gap: 1em;
      grid-row-gap: 1em;
      grid-template-columns: repeat(2, 1fr);
      grid-template-areas:
        'one two'
        'what what'
        'how how';

      .box {
        padding: 2em;

        :gloabl(.cta) {
          text-align: right;
        }
      }
    }
  }

  @media (min-width: 1200px) {
    .blurb {
      grid-column-gap: 1em;
      grid-row-gap: 5em;
      grid-template-columns: repeat(6, 1fr);
      grid-template-areas:
        'one one two two two two'
        'what what what how how how';

      .what {
        margin: 0;
      }

      .box :gloabl(.cta) {
        text-align: left;
      }
    }
  }
</style>
