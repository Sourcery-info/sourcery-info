<script>
	
	// @ts-nocheck
	import '$lib/sass/global.scss';
	import Navbar from '$lib/ui/navbar.svelte';
	import Sidebar from '$lib/ui/sidebar.svelte';
	// import { authStore } from '$lib/stores/authStore';
	// import { goto } from '$app/navigation';

	export let data = {
		projects: [],
		project: null
	};

	// console.log(data.session);

	// $: if (!$authStore.isAuthenticated && !['/login', '/create-account'].includes(window.location.pathname)) {
	// 	goto('/login');
	// }
</script>

<svelte:head>
	<title>Sourcery.info</title>
</svelte:head>
<div class="grid-main">
	<Navbar project={data.project} version={'0.0.1'} session={data.session} />
	<div class="content container mt-3">
		<slot />
	</div>
</div>
