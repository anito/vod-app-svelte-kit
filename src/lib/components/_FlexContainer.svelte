<script>
  export let style = '';
</script>

<div class="wrapper">
  <div class="container" {style}>
    <span style="text-align: center;"><slot /></span>
  </div>
</div>

<style>
  .wrapper {
    height: 100%;
    display: flex;
    justify-content: center;
  }
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 1.5em;
    font-weight: 600;
    opacity: 0.5;
  }
</style>
