<script lang="ts">
	// @ts-nocheck
	/** @type {import('./$types').PageData} */
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { entitiesStore } from '$lib/stores/entities';
	export let data;
	// Add tab state management
</script>

<div class="text-white">
	<h1 class="text-3xl font-bold mb-4">Entity: {data.entity.value}</h1>
	<div class="flex flex-col gap-4">
		{#each data.chunks as chunk}
			<div class="bg-gray-800 rounded-lg p-4 shadow-lg">
				<div class="text-md text-gray-300 mb-2">{chunk.content}</div>
				<div class="text-xl text-white">{chunk.context}</div>
			</div>
		{/each}
	</div>
</div>
