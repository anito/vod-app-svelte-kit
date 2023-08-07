<script lang="ts">
  export { className as class };
  export let size = 'sm';
  export let alt = '';
  export let src = '';

  let className = '';
</script>

<div class="avatar__root {size} {className}">
  <img class="avatar__graphic" {alt} {src} />
  <slot />
</div>

<style>
  .avatar__root {
    width: 40px;
    height: 40px;
    display: flex;
    overflow: hidden;
    font-size: 1.25rem;
    align-items: center;
    flex-shrink: 0;
    font-family: Roboto, 'Helvetica', 'Arial', sans-serif;
    line-height: 1;
    user-select: none;
    border-radius: 50%;
    justify-content: center;
    box-shadow: 0px 0px 0px 4px var(--primary), 0px 0px 0px 10px var(--background-intense);
    right: 40px;
    background-color: var(--background);
    z-index: 1;
  }
  .avatar__graphic {
    color: transparent;
    width: 100%;
    height: 100%;
    object-fit: cover;
    text-align: center;
    text-indent: 10000px;
  }
  .lg {
    width: 100px;
    height: 100px;
  }
  .md {
    width: 80px;
    height: 80px;
  }
  .sm {
    width: 50px;
    height: 50px;
  }
</style>
