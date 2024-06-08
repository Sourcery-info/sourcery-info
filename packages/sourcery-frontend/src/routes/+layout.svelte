<script>
	// @ts-nocheck
	import '$lib/sass/global.scss';
	import Navbar from '$lib/ui/navbar.svelte';
	import Sidebar from '$lib/ui/sidebar.svelte';
	export let data = {
		projects: [],
		project: null
	};
</script>

<svelte:head>
	<title>Sourcery.info</title>
</svelte:head>
<div class="grid-main">
	<Navbar project={data.project} version={'0.0.1'} />
	<div class="main">
		<Sidebar selected_project={data.project} projects={data.projects} />
		<div class="content container">
			<slot />
		</div>
	</div>
</div>
