<script>
	// @ts-nocheck
	// import '$lib/sass/global.scss';
	import '../app.css';
	import Sidebar from '$lib/ui/sidebar.svelte';
	import Alert from '$lib/ui/alert.svelte';

	export let data = {
		projects: [],
		project: null,
		alerts: []
	};
</script>

<svelte:head>
	<title>Sourcery.info</title>
</svelte:head>
<div class="min-h-full bg-gray-900">
	<!-- <Navbar project={data.project} version={'0.0.1'} session={data.session} user={data.user} /> -->
	{#if data.alerts && data.alerts.length > 0}
		<div class="alerts-container">
			{#each data.alerts as alert}
				<Alert color={alert.type} dismissible={true}>
					{alert.message}
				</Alert>
			{/each}
		</div>
	{/if}
	<div class="bg-gray-900">
		<slot />
	</div>
</div>

<style lang="scss">
	.alerts-container {
		position: fixed;
		top: 70px;
		right: 20px;
		z-index: 1000;
		max-width: 400px;
	}
</style>
