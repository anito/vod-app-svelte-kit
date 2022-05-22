<script>
  export let message;
</script>

{#if message}
  <div class="error-message">
    <p>{message}</p>
  </div>
{/if}
