<script lang="ts">
	import { onMount } from 'svelte';
	import type { Entity } from '@sourcery/common/types/Entities.type';
	export let data;

	let entities: Entity[] = [];
	let entities_by_type: Record<string, Entity[]> = {};
	let expanded: Record<string, boolean> = {
		PERSON: false,
		ORGANIZATION: false,
		LOCATION: false,
		DATE: false,
		OTHER: false
	};

	onMount(async () => {
		const response = await fetch(
			`/file/${data.props.project_id}/${data.props.file._id}/view/entities`
		);
		entities = await response.json();
		entities_by_type = entities.reduce((acc: Record<string, Entity[]>, entity) => {
			acc[entity.type] = acc[entity.type] || [];
			acc[entity.type].push(entity);
			return acc;
		}, {});
		// Sort entities by value
		for (const type in entities_by_type) {
			entities_by_type[type].sort((a, b) => a.value.localeCompare(b.value));
		}
	});

	function toggleSection(type: string) {
		expanded[type] = !expanded[type];
	}

	const typeLabels = {
		PERSON: 'People',
		ORGANIZATION: 'Organizations',
		LOCATION: 'Locations',
		DATE: 'Dates',
		OTHER: 'Other'
	};
</script>

<div class="p-6">
	<h1 class="text-2xl font-bold mb-6">Entities</h1>

	{#each Object.entries(typeLabels) as [type, label]}
		{#if entities_by_type[type]?.length}
			<div class="mb-4 border border-gray-700 rounded-lg overflow-hidden">
				<button
					class="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 flex justify-between items-center"
					on:click={() => toggleSection(type)}
				>
					<h2 class="text-lg font-semibold">{label} ({entities_by_type[type]?.length || 0})</h2>
					<svg
						class="w-5 h-5 transform transition-transform {expanded[type] ? 'rotate-180' : ''}"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>
				{#if expanded[type]}
					<div class="p-4 bg-gray-900">
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
							{#each entities_by_type[type] || [] as entity}
								<div class="bg-gray-800 rounded p-2 hover:bg-gray-700 transition-colors">
									{entity.value}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	{/each}
</div>
