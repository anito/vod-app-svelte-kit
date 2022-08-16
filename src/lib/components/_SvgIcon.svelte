<!--
-----------------------------------------------
	svg icon
	- https://github.com/jacobmischka/svelte-feather-icon
	- https://feathericons.com/
-----------------------------------------------
-->
<script>
  // @ts-nocheck

  export let name;
  export let fillColor = 'none';
  export let size = 20;
  export { className as class };

  let className = '';
</script>

<svg class={className} width={size} height={size} style="fill: {fillColor}">
  <use xlink:href="#{name}" />
</svg>

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
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
  }
</style>
