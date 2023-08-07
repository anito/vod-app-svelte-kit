<script lang="ts">
  export let message: string;
</script>

{#if message}
  <div class="error-message">
    <p>{message}</p>
  </div>
{/if}
