<!--
-----------------------------------------------
	svg icon
	- https://github.com/jacobmischka/svelte-feather-icon
	- https://feathericons.com/
-----------------------------------------------
-->
<script lang="ts">
  export let name: string = '';
  export let fillColor = 'currentColor';
  export let strokeWidth = '0';
  export let size = 20;
  export let style = '';
  export { className as class };

  let className = '';
</script>

{#if name}
  <svg class={className} width={size} height={size} style={`fill: ${fillColor}; stroke-width: ${strokeWidth}; ${style}`} style:--icon-size={size}>
    <use xlink:href="#{name}" />
  </svg>
{/if}

<style>
  svg {
    display: inline;
    position: relative;
    overflow: hidden;
    vertical-align: middle;
    -o-object-fit: contain;
    object-fit: contain;
    -webkit-transform-origin: center center;
    transform-origin: center center;
    stroke: currentColor;
    stroke-width: 1px;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
  }
</style>
