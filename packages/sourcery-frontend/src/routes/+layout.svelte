<!--
 Copyright (C) 2025 Jason Norwood-Young
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.
 
 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->

<script>
	// @ts-nocheck
	// import '$lib/sass/global.scss';
	import '../app.css';
	import Alert from '$lib/ui/alert.svelte';
	import '$lib/i18n/setup';

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
