<script>
  import ParallaxLogo from './ParallaxLogo.svelte';

  export let title;
  export let tagline;
  export let logotype;
  export let outline;
</script>

<ParallaxLogo alt="{title} logo" src={outline} />

<section class="hero">
  <img alt="{title} logotype" class="logotype" src={logotype} />
  <h3>{tagline}</h3>
</section>

<style>
  .hero {
    position: relative;
    margin: 6.25rem auto;
    padding: 0 var(--side-nav);
    max-width: 75rem;
  }

  h3 {
    color: var(--text);
  }

  .hero {
    margin: 6.25rem auto;
  }

  .hero h3,
  .logotype {
    position: relative;
    left: 1rem;
  }

  .hero h3 {
    font-size: 1.25rem;
  }

  .logotype {
    height: 2.5rem;
  }

  @media (min-width: 640px) {
    .logotype {
      height: 3.75rem;
    }

    .hero h3 {
      font-size: var(--h3);
    }
  }

  @media (min-width: 800px) {
    .hero {
      margin: 9.375rem auto;
    }

    .hero h3,
    .logotype {
      left: 1.875rem;
    }
  }

  @media (min-width: 1100px) {
    .logotype {
      height: 5.75rem;
    }
  }
</style>
