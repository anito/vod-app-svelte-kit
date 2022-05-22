<script>
	import { onMount, getContext } from 'svelte';
	import Uploader from './_Uploader.svelte';
	import Header from './Header.svelte';
	import { _ } from 'svelte-i18n';

	export { className as class };
	export let type = '';
	export let uid = '';
	export let acceptedFiles = '';
	export let options = {};
	export let events = {};

	const { getSnackbar, configSnackbar } = getContext('snackbar');

	let className = '';
	let count = 0;
	let uploader;
	let snackbar;

	$: path = `${type.toLowerCase()}s`;
	$: fileTypes = (type === 'avatar' && 'image') || type;
	$: acceptedFiles = !acceptedFiles && `${fileTypes}/*`;
	$: options = { ...options, acceptedFiles, path };

	function init(node) {
		uploader = node;
	}

	onMount(() => {
		snackbar = getSnackbar();

		Object.entries(events).map(([eventKey, eventFunc]) => {
			uploader.addEventListener(eventKey, eventFunc);
		});

		return () =>
			Object.entries(events).map(([eventKey, eventFunc]) => {
				uploader.removeEventListener(eventKey, eventFunc);
			});
	});

	function onAddedfile(file) {
		++count;
	}

	function onRemovedfile(file) {
		--count;
	}

	function onSuccess(e) {
		if (options['uploadMultiple']) return;
		handleUpload(e.detail);
	}

	function onError(e) {
		configSnackbar(e.detail);
		snackbar.open();
	}

	function onSuccessmultiple(e) {
		handleUpload(e.detail);
	}

	function handleUpload(detail) {
		uploader.dispatchEvent(new CustomEvent('uploadDone', { detail }));
	}
</script>

<div class="uploader-wrapper {className}" use:init>
	<Header h="4" mdc class="upload-header">{$_('text.upload_type', { values: { type } })}</Header>
	<div class="subheader">
		<span>{$_('text.file_queue', { values: { count } })}</span>
		<span
			>({$_('text.max_file_count', {
				values: { count: options.maxFiles }
			})})</span
		>
	</div>
	<Uploader
		on:Uploader:successmultiple={onSuccessmultiple}
		on:Uploader:success={onSuccess}
		on:Uploader:error={onError}
		on:Uploader:addedfile={onAddedfile}
		on:Uploader:removedfile={onRemovedfile}
		{...options}
		{uid}
	/>
</div>

<style>
	:global(.upload-header) {
		text-transform: capitalize;
	}
	.subheader {
		font-size: 0.8rem;
	}
</style>
