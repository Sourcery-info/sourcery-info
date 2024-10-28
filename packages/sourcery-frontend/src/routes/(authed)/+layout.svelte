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

<div class="grid-main">	
	<div class="main">
		<Sidebar selected_project={data.project} projects={data.projects} />
		<div class="content container">
			<slot />
		</div>
	</div>
</div>
