<script>
  import { page } from '$app/stores';
</script>

<div class="flex flex-1 justify-center">
  <div class="error">
    <span class="status">{$page.status}</span>
    <div class="message">
      <h1>{$page.error?.message}</h1>
    </div>
  </div>
</div>

<style>
  .error {
    display: flex;
    align-items: center;
    max-width: 32rem;
    margin: 0 1rem;
    color: var(--error);
  }

  .status {
    font-weight: 200;
    font-size: 3rem;
    line-height: 1;
    position: relative;
    top: -0.05rem;
  }

  .message {
    border-left: 1px solid #ccc;
    padding: 0 0 0 1rem;
    margin: 0 0 0 1rem;
    min-height: 2.5rem;
    display: flex;
    align-items: center;
  }

  .message h1 {
    font-weight: 400;
    font-size: 1em;
    margin: 0;
  }
</style>
