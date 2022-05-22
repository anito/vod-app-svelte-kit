<script>
  export let color = "warning";
  export let size = 10;

  $: fillColor = (color.startsWith("#") && color) || `var(--${color})`;
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 {size} {size}"
>
  <circle cx={size / 2} cy={size / 2} r={size / 2} fill={fillColor} />
</svg>

<style>
  svg {
    margin: 2px 0;
  }
</style>
