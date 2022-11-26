<script>
  import { session } from '$lib/stores';
  import { Graphic } from '@smui/list';
  import { Icon } from '@smui/common';
  import { getMediaAvatar, placeholderDotComAvatar } from '$lib/utils';

  /** @type {any | null} */
  export let user = null;
  export let dense = false;
  export let inactive = false;
  export let size = '24';
  export let borderSize = '0';
  export let borderColor = '';
  export let extendedBorderSize = '10';
  export let extendedBorderColor = '';
  export let overlayColor = '';
  export let overlayOpacity = 0.5;

  /**
   * @type {{icon?: string, position?: any, color?: string | null, size?: string}}
   */
  export let badge = {
    icon: '',
    position: 'BOTTOM_RIGHT',
    color: '#ff0000',
    size: '20'
  };
  export let style = '';
  export let fallback = '';

  const width = parseInt(size);
  const height = parseInt(size);

  /**
   * @type {{TOP_RIGHT: string, BOTTOM_RIGHT: string, BOTTOM_LEFT: string, TOP_LEFT: string} | any}
   */
  const badgePosition = {
    TOP_RIGHT: 'tr',
    BOTTOM_RIGHT: 'br',
    BOTTOM_LEFT: 'bl',
    TOP_LEFT: 'tl'
  };
  /** @type {string | undefined}} */
  let src;

  borderColor = borderColor.startsWith('--')
    ? `var(${borderColor})`
    : borderColor
    ? borderColor
    : 'transparent';
  extendedBorderColor = extendedBorderColor.startsWith('--')
    ? `var(${extendedBorderColor})`
    : extendedBorderColor
    ? extendedBorderColor
    : 'transparent';
  overlayColor = overlayColor.startsWith('--')
    ? `var(${overlayColor})`
    : overlayColor
    ? overlayColor
    : 'transparent';
  badge.color?.startsWith('--') && (badge.color = `var(${badge.color})`);

  $: sizeVar = `--size: ${size}px;`;
  $: overlayVars =
    (overlayColor && `--overlay-color: ${overlayColor}; --overlay-opacity: ${overlayOpacity}`) ||
    '';
  $: (badge.icon && (badge.position = badgePosition[badge.position])) || badgePosition['TOP_LEFT'];
  $: style = ((style) => style.trim().replace(/ +(?= )/g, ''))(
    `${style} ${sizeVar} ${overlayVars}`
  );
  $: (async (user) => {
    if (user?.avatar?.src?.startsWith('http')) {
      Promise.resolve(user.avatar.src).then((val) => (src = val));
    } else if (user?.avatar) {
      await getMediaAvatar(user?.avatar?.id, $session.user?.jwt, {
        width,
        height,
        square: 1,
        quality: 100
      }).then((val) => (src = val));
    } else if (fallback) {
      Promise.resolve(fallback).then((val) => (src = val));
    } else {
      Promise.resolve(placeholderDotComAvatar(user?.email?.split('@').join(' '))).then(
        (val) => (src = val)
      );
    }
  })(user);
</script>

<div class="user-graphics-outer" class:inactive class:dense {style}>
  {#if src}
    <Graphic
      class="user-graphics relative"
      title={`${user?.name} (${user?.role || $session.role})`}
      style="
        display: inline-flex;
        vertical-align: middle;
        width: {width}px;
        height: {height}px;
        box-shadow: inset 0px 0px 0px {borderSize}px {borderColor} {extendedBorderSize
        ? `, 0px 0px 0px ${extendedBorderSize}px ${extendedBorderColor}`
        : ''};
        background-image: url('{src}');
        background-size: cover;
        background-color: var(--back-light);"
    />
    {#if badge.icon}
      <div class="badge {badge.size} {badge.position}">
        <Icon style="color:{badge.color}" class="material-icons">{badge.icon}</Icon>
      </div>
    {/if}
  {/if}
</div>

<style lang="scss">
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
    &.tr {
      transform: translate(calc(var(--size) - var(--badge-size)), calc(var(--size) * -1));
    }
    &.br {
      transform: translate(calc(var(--size) - var(--badge-size)), calc(var(--badge-size) * -1));
    }
    &.bl {
      transform: translate(0px, calc(var(--badge-size) * -1));
    }
    &.tl {
      transform: translate(0px, calc(var(--size) * -1));
    }
    &.small {
      --badge-size: 18px;
      width: var(--badge-size);
      height: var(--badge-size);

      :global(.material-icons) {
        font-size: 0.875em;
      }
    }
    &.medium {
      --badge-size: 30px;
      width: var(--badge-size);
      height: var(--badge-size);

      :global(.material-icons) {
        font-size: 1.4444em;
      }
    }
    &.large {
      --badge-size: 34px;
      width: var(--badge-size);
      height: var(--badge-size);

      :global(.material-icons) {
        font-size: 1.6666em;
      }
    }
    :global(.material-icons) {
      font-size: 1.1em;
      border-radius: 50%;
      border-width: 2px;
      background-color: #ffffff;
    }
  }
  :global(.user-graphics::before) {
    content: '';
    width: 100%;
    height: 100%;
    background-color: var(--overlay-color);
    border-radius: 50%;
    opacity: var(--overlay-opacity);
  }
  .inactive :global(.user-graphics::before) {
    background-color: #fff;
    opacity: 0.7;
  }
</style>
