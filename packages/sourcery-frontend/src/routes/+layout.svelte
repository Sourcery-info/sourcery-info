<script>
	
	// @ts-nocheck
	import '$lib/sass/global.scss';
	import Navbar from '$lib/ui/navbar.svelte';
	import Sidebar from '$lib/ui/sidebar.svelte';
	import { Alert } from '@sveltestrap/sveltestrap';

	export let data = {
		projects: [],
		project: null,
	};

</script>

<svelte:head>
	<title>Sourcery.info</title>
</svelte:head>
<div class="grid-main">
	<Navbar project={data.project} version={'0.0.1'} session={data.session} />
	<div class="content">
		<slot />
	</div>
</div>

<style lang="scss">
	.content {
		height: calc(100vh - 50px);
		overflow-y: auto;
		position: relative;
		display: block;
	}
</style>
