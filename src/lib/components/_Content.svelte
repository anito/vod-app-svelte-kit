<script>
	import { getContext } from 'svelte';
	import { fly, fade, slide } from 'svelte/transition';

	import Popup from './Popup.svelte';
	import PopupLong from './PopupLong.svelte';
	import Dialog from './Dialog.svelte';

	const { open } = getContext('default-modal');

	let opening = false;
	let opened = false;
	let closing = false;
	let closed = false;

	const showPopup = () => {
		open(Popup, { message: "It's a popup!" });
	};
	const showPopupLong = () => {
		open(
			PopupLong,
			{
				message: "It's a popup with long text!"
			},
			{
				styleBg: {
					background: 'rgba(200, 255, 0, 0.66)'
				},
				styleWindow: {
					border: '2px solid #00beff',
					boxShadow: 'inset 0 0 0 2px white, 0 0 0 2px white',
					background: '#ff7000'
				},
				transitionWindow: fly,
				transitionWindowProps: {
					y: -100,
					duration: 500
				}
			}
		);
	};
	const showPopupCustom = () => {
		open(
			Popup,
			{
				message: "It's a customized popup!"
			},
			{
				styleBg: {
					background: 'rgba(200, 255, 0, 0.66)'
				},
				styleWindow: {
					border: '2px solid #00beff',
					boxShadow: 'inset 0 0 0 2px white, 0 0 0 2px white',
					background: '#ff7000'
				},
				styleContent: {
					color: '#9500ff',
					fontFamily: 'Comic Sans',
					fontStyle: 'italic'
				},
				transitionWindow: fly,
				transitionWindowProps: {
					y: 100,
					duration: 1000
				}
			},
			{
				onOpen: () => {
					opening = true;
				},
				onOpened: () => {
					opening = false;
					opened = true;
				},
				onClose: () => {
					opened = false;
					closing = true;
				},
				onClosed: () => {
					closing = false;
					closed = true;
					setTimeout(() => {
						closed = false;
					}, 1000);
				}
			}
		);
	};

	let name = '';
	let status = 0;

	const onCancel = (text) => {
		name = '';
		status = -1;
	};

	const onOkay = (text = name) => {
		name = text;
		status = 1;
	};

	const showDialog = () => {
		open(
			Dialog,
			{
				message: 'What is your name?',
				hasForm: true,
				onCancel,
				onOkay
			},
			{
				closeButton: false,
				closeOnEsc: false,
				closeOnOuterClick: false
			}
		);
	};
</script>

<section>
	<button on:click={showPopup}>Show a popup!</button>
	<br />
	<button on:click={showPopupLong}>Show a popup with long text!</button>
	<br />
	<button on:click={showPopupCustom}>Show a customized popup and listen to events!</button>
	<br />
	<button on:click={showDialog}>Show a dialog!</button>

	{#if status === 1}
		<p>Hi {name}! =</p>
	{:else if status === -1}
		<p><em>Dialog was canceled</em></p>
	{/if}

	<div id="state">
		{#if opening}
			<p>opening modal...</p>
		{:else if opened}
			<p>opened modal!</p>
		{:else if closing}
			<p>closing modal...</p>
		{:else if closed}
			<p>closed modal!</p>
		{/if}
	</div>
</section>

<style>
	section {
		padding-top: 0.5em;
	}

	#state {
		position: absolute;
		top: 0;
		right: 0;
		opacity: 0.33;
		font-size: 0.8em;
	}
</style>
