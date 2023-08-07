<script lang="ts">
  let hovering: boolean;

  function enter() {
    hovering = true;
  }

  function leave() {
    hovering = false;
  }
</script>

<div tabindex="0" role="button" on:mouseenter={enter} on:mouseleave={leave}>
  <slot {hovering} />
</div>
