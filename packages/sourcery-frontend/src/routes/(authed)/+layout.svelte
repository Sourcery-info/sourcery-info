<script>
	// @ts-nocheck
	import '$lib/sass/global.scss';
	import Sidebar from '$lib/ui/sidebar.svelte';

	export let data = {
		projects: [],
		project: null
	};
</script>

<div class="grid-main">
	<div class="alerts">
	</div>
	<div class="main">
		<Sidebar selected_project={data.project} projects={data.projects} />
		<div class="content">
			<slot />
		</div>
	</div>
</div>

<style lang="scss">
	.grid-main {
		display: grid;
		grid-template-rows: auto 1fr;
		min-height: calc(100vh - 100px);
		width: 100%;
	}

	.main {
		display: grid;
		grid-template-columns: auto 1fr;
		height: 100%;
		overflow: hidden;
	}

	.content {
		height: 100%;
		overflow-y: auto;
		padding: 20px;
	}

	.alerts {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 300px;
		z-index: 1000;

		.alert-item {
			box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
		}
	}
</style>
