<script lang="ts">
  import { session } from '$lib/stores';
  import { Graphic } from '@smui/list';
  import { Icon } from '@smui/common';
  import { addClass, getMediaAvatar, placeholderDotComAvatar } from '$lib/utils';
  import type { Badge } from '$lib/types';
  import type { User } from '$lib/classes/repos/types';

  export let user: User | null = null;
  export let dense = false;
  export let inactive = false;
  export let size = 24;
  export let borderSize = 0;
  export let borderColor = '';
  export let extendedBorderSize = 10;
  export let extendedBorderColor = '';
  export let overlayColor = '';
  export let overlayOpacity = 0.5;
  export let badge: boolean | Badge | undefined = false;
  export let style = '';
  export let fallback = '';
  export { className as class };

  const width = size;
  const height = size;
  const badgePositions = {
    TOP_RIGHT: 'tr',
    BOTTOM_RIGHT: 'br',
    BOTTOM_LEFT: 'bl',
    TOP_LEFT: 'tl'
  };

  let className = '';
  let src: string | undefined;

  if (typeof badge === 'object') {
    badge = {
      icon: '',
      color: '#ff0000',
      size: 'small',
      position: 'TOP_LEFT',
      ...badge
    };
    badge.color?.startsWith('--') && (badge.color = `var(${badge.color})`);
  }

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

  $: sizeVar = `--size: ${size}px;`;
  $: overlayVars =
    (overlayColor && `--overlay-color: ${overlayColor}; --overlay-opacity: ${overlayOpacity}`) ||
    '';
  $: style = ((style) => style.trim().replace(/ +(?= )/g, ''))(
    `${style} ${sizeVar} ${overlayVars}`
  );
  $: userGraphicTitle = user ? `${user?.name} (${$session?.role})` : '';
  $: (async (user) => {
    const getSource = async (user: User | null) => {
      if (user?.avatar?.src?.startsWith('http')) {
        return user.avatar.src;
      } else if (user?.avatar) {
        return await getMediaAvatar(user?.avatar?.id, $session.user?.jwt, {
          width,
          height,
          square: 1,
          quality: 100
        });
      } else if (fallback) {
        return fallback;
      } else {
        return placeholderDotComAvatar(user?.email?.split('@').join(' '));
      }
    };
    src = await getSource(user);
  })(user);
</script>

<span use:addClass={className} class="user-graphics-outer {className}" class:inactive class:dense {style}>
  {#if src}
    <Graphic
      class="user-graphics relative"
      title={userGraphicTitle}
      style="
        display: inline-flex;
        vertical-align: middle;
        width: {width + borderSize}px;
        height: {height + borderSize}px;
        box-shadow: 0px 0px 0px var(--graphic-border-size, {borderSize}px) {borderColor} {extendedBorderSize
        ? `, 0px 0px 0px var(--extended-graphic-border-size, ${extendedBorderSize}px) ${extendedBorderColor}`
        : ''};
        background-image: url('{src}');
        background-size: cover;
        background-color: var(--back-light);"
    />
    {#if typeof badge === 'object'}
      <div class="badge {badge.size} {badgePositions[badge.position || 'TOP_LEFT']}">
        <Icon style="color:{badge.color}" class="material-icons">{badge.icon}</Icon>
      </div>
    {/if}
  {/if}
</span>

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
      --badge-size: 16px;
      width: var(--badge-size);
      height: var(--badge-size);
    }
    &.medium {
      --badge-size: 30px;
      width: var(--badge-size);
      height: var(--badge-size);
    }
    &.large {
      --badge-size: 34px;
      width: var(--badge-size);
      height: var(--badge-size);
    }
    :global(.material-icons) {
      font-size: var(--badge-size);
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
