<script>
	// @ts-nocheck

	import { session } from '$app/stores';
	import { Graphic } from '@smui/list';
	import { Icon } from '@smui/common';
	import { getMediaAvatar, placeholderDotComAvatar } from '$lib/utils';

	export let user = {};
	export let dense = '';
	export let width = 24;
	export let height = 24;
	export let borderSize = 0;
	export let borderColor = '';
	export let extendedBorderSize = 0;
	export let extendedBorderColor = '';
	export let fallbackImage;
	export let badge = {};
	export let style = '';

	let src;

	borderSize = !isNaN(borderSize) ? parseInt(borderSize) : borderSize ? 1 : borderSize;
	borderColor = borderColor.startsWith('--')
		? `var(${borderColor})`
		: borderColor
		? borderColor
		: 'transparent';
	extendedBorderSize = !isNaN(extendedBorderSize)
		? parseInt(extendedBorderSize)
		: extendedBorderSize
		? 10
		: extendedBorderSize;
	extendedBorderColor = extendedBorderColor.startsWith('--')
		? `var(${extendedBorderColor})`
		: extendedBorderColor
		? extendedBorderColor
		: 'transparent';

	$: (async (user) => {
		if (!user?.avatar) {
			src = fallbackImage || placeholderDotComAvatar(user?.name);
			return;
		}

		let avatar = user.avatar;
		if (avatar.src && avatar.src.startsWith('http')) {
			src = avatar.src;
			return;
		}

		let res = await getMediaAvatar(avatar.id, $session.user, {
			width,
			height,
			square: 1,
			quality: 100
		});
		if (res) src = res;
	})(user);
</script>

<div class="user-graphics-outer" class:dense {style}>
	{#if src}
		<Graphic
			class="user-graphics"
			style="display: inline-flex; vertical-align: middle; width: {width}px; height: {height}px; box-shadow: 0px 0px 0px {borderSize}px {borderColor} {extendedBorderSize
				? `, 0px 0px 0px ${extendedBorderSize}px ${extendedBorderColor}`
				: ''}; background-image: url('{src}'); background-size: cover;"
		/>
	{/if}
	{#if badge.icon}
		<div class="badge">
			<Icon style="color:{badge.color}" class="material-icons">{badge.icon}</Icon>
		</div>
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
		width: 14px;
		height: 14px;
		right: 12px;
		top: -5px;
	}
	.badge :global(.material-icons) {
		font-size: 1.1em;
	}
</style>
