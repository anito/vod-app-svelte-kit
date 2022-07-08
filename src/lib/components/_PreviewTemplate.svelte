<script>
	// @ts-nocheck

	import IconButton, { Icon } from '@smui/icon-button';

	let poster = `https://via.placeholder.com/80x80.png?text=video`;
</script>

<div class="file-row">
	<!-- This is used as the file preview template -->
	<div>
		<span class="preview">
			<img class="rounded" alt="preview" data-dz-thumbnail src={poster} />
			<IconButton class="dz-button" data-dz-remove>
				<Icon class="material-icons">cancel</Icon>
			</IconButton>
		</span>
	</div>
	<div class="hidden">
		<p class="name" data-dz-name />
		<strong class="error text-danger" data-dz-errormessage />
	</div>
	<div class="hidden">
		<p class="size" data-dz-size />
		<div
			class="progress progress-striped active"
			role="progressbar"
			aria-valuemin="0"
			aria-valuemax="100"
			aria-valuenow="0"
		>
			<div class="progress-bar progress-bar-success" style="" data-dz-uploadprogress />
		</div>
	</div>
</div>

<style>
	.file-row {
		padding: 10px;
		position: relative;
		z-index: 1;
	}
	:global(.dz-error) {
		background-color: #ff0000;
	}
	:global(.dz-button) {
		position: absolute;
		top: -12px;
		right: -12px;
		display: flex;
	}
</style>
