<script>
  import { session } from '$lib/stores';
  import { Graphic } from '@smui/list';
  import { Icon } from '@smui/common';
  import { getMediaAvatar, placeholderDotComAvatar } from '$lib/utils';

  /** @type {import('$lib/types').User} */
  export let user;
  /** @type {any} */
  export let dense;
  export let size = '24';
  export let borderSize = '0';
  export let borderColor = '';
  export let extendedBorderSize = 0;
  export let extendedBorderColor = '';
  /** @type {{color: string, size: number, icon: string, position: string}} */
  export let badge = {
    color: '',
    size: 20,
    icon: '',
    position: 'TOP_RIGHT'
  };
  export let style = '';
  export let fallback = '';
  export let title = false;

  const width = size;
  const height = size;
  const f = (parseInt(size) * 30) / 100;
  /** @type {{TOP_RIGHT: string, TOP_LEFT: string, BOTTOM_RIGHT: string, BOTTOM_LEFT: string} | any} */
  const badgePosition = {
    TOP_RIGHT: `top: ${8 - f}px; left:${parseInt(width) - f}px;`,
    TOP_LEFT: `top:${0 - f}px; left: ${0 - f}px;`,
    BOTTOM_RIGHT: `top: ${parseInt(width) - f}px; left:${parseInt(width) - f}px;`,
    BOTTOM_LEFT: `top: ${parseInt(width) - f}px; left:${parseInt(width) - f}px;`
  };
  /** @type {string | undefined}} */
  let src;

  borderSize = !isNaN(parseInt(borderSize)) ? borderSize : borderSize ? '1' : borderSize;
  borderColor = borderColor.startsWith('--')
    ? `var(${borderColor})`
    : borderColor
    ? borderColor
    : 'transparent';
  extendedBorderSize = !isNaN(extendedBorderSize)
    ? extendedBorderSize
    : extendedBorderSize
    ? 10
    : extendedBorderSize;
  extendedBorderColor = extendedBorderColor.startsWith('--')
    ? `var(${extendedBorderColor})`
    : extendedBorderColor
    ? extendedBorderColor
    : 'transparent';
  badge.color?.startsWith('--') && (badge.color = `var(${badge.color})`);

  $: (async (user) => {
    if (user?.avatar?.src?.startsWith('http')) {
      Promise.resolve(user.avatar.src).then((val) => (src = val));
    } else if (user?.avatar) {
      await getMediaAvatar(user?.avatar?.id, $session.user, {
        width,
        height,
        square: 1,
        quality: 100
      }).then((val) => (src = val));
    } else if (fallback) {
      Promise.resolve(fallback).then((val) => (src = val));
    } else {
      Promise.resolve(placeholderDotComAvatar(user.email?.split('@').join(' '))).then(
        (val) => (src = val)
      );
    }
  })(user);
  $: badge.icon && (badge.position = badgePosition[badge.position] || badgePosition['TOP_RIGHT']);
</script>

<div class="user-graphics-outer" class:dense {style} title={title ? user?.role : ''}>
  {#if src}
    <Graphic
      class="user-graphics relative"
      style="display: inline-flex; vertical-align: middle; width: {width}px; height: {height}px; box-shadow: 0px 0px 0px {borderSize}px {borderColor} {extendedBorderSize
        ? `, 0px 0px 0px ${extendedBorderSize}px ${extendedBorderColor}`
        : ''}; background-image: url('{src}'); background-size: cover; background-color: var(--back-light);"
    />
    {#if badge.icon}
      <div class="badge {badge.size}" style={badge.position}>
        <Icon style="color:{badge.color}" class="material-icons">{badge.icon}</Icon>
      </div>
    {/if}
  {/if}
</div>

<style>
  .user-graphics-outer {
    display: inline-block;
    position: relative;
  }
  .user-graphics-outer :global(.user-graphics) {
    border-radius: 50%;
  }
  .user-graphics-outer.dense :global(.user-graphics) {
    margin-right: 0;
  }
  .badge {
    position: absolute;
  }
  .badge:global() {
    position: absolute;
    width: 14px;
    height: 14px;
  }
  .badge:global(.medium) {
    width: 18px;
    height: 18px;
  }
  .badge:global(.large) {
    width: 22px;
    height: 22px;
  }
  .badge.small :global(.material-icons) {
    font-size: 0.8em;
  }
  .badge :global(.material-icons) {
    font-size: 1.1em;
    border-radius: 50%;
    border-width: 2px;
    background-color: #ffffff;
  }
  .badge.medium :global(.material-icons) {
    font-size: 1.3em;
  }
  .badge.large :global(.material-icons) {
    font-size: 1.7em;
  }
</style>
