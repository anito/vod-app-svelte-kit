<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="flex flex-1 justify-center error-container">
  <div class="error">
    <span class="status">{$page.status}</span>
    <div class="message">
      <h1>{$page.error?.message}</h1>
    </div>
  </div>
</div>

<style>
  .error-container {
    width: 100vw;
    height: 100vh;
  }

  .error {
    --font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
      Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
      sans-serif;
    font-family: var(--font-family);
    display: flex;
    align-items: center;
    justify-content: center;
    color: currentColor;
  }

  .status {
    font-weight: 200;
    font-size: 3rem;
    line-height: 1;
    position: relative;
    top: -0.05rem;
  }

  .message {
    padding: 0 0 0 1rem;
    margin: 0 0 0 1rem;
    min-height: 2.5rem;
    height: 2.5rem;
    display: flex;
    position: relative;
    align-items: center;
  }

  .message::before {
    content: '';
    opacity: 0.2;
    position: absolute;
    left: 0;
    display: inline-block;
    height: 100%;
    border-left: 1px solid;
  }

  .message h1 {
    font-family: var(--font-family);
    font-weight: 200;
    font-size: 1em;
    margin: 0;
  }
</style>
