<script lang="ts">
	import { page } from '$app/state';
	import { entitiesStore } from '$lib/stores/entities';
	import personIcon from '$lib/assets/icons/person.svg?raw';
	import organizationIcon from '$lib/assets/icons/organization.svg?raw';
	import locationIcon from '$lib/assets/icons/location.svg?raw';
	import dateIcon from '$lib/assets/icons/date.svg?raw';
	import tagIcon from '$lib/assets/icons/tag.svg?raw';

	let { selected_project, onclick } = $props();

	const MAX_ENTITIES = 8;
	let visibleEntities = $derived($entitiesStore.slice(0, MAX_ENTITIES));
	let hasMoreEntities = $derived($entitiesStore.length > MAX_ENTITIES);
</script>

<div>
	<div class="text-xs/6 font-semibold text-gray-400">
		<a href="/entity/{selected_project._id}" {onclick}>Entities</a>
	</div>
	<ul role="list" class="-mx-2 mt-2 space-y-0">
		{#if $entitiesStore.length > 0}
			{#each visibleEntities as entity}
				<li>
					<a
						href={`/entity/${selected_project._id}/${entity._id}`}
						{onclick}
						class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-regular text-gray-400 hover:bg-gray-800 hover:text-white {entity._id ===
						page.params.entity_id
							? 'bg-gray-800 text-white'
							: ''}"
					>
						{#if entity.type === 'PERSON'}
							{@html personIcon}
						{:else if entity.type === 'ORGANIZATION'}
							{@html organizationIcon}
						{:else if entity.type === 'LOCATION'}
							{@html locationIcon}
						{:else if entity.type === 'DATE'}
							{@html dateIcon}
						{:else}
							{@html tagIcon}
						{/if}
						<span class="truncate">{entity.value}</span>
					</a>
				</li>
			{/each}
			{#if hasMoreEntities}
				<li>
					<a
						href="/entity/{selected_project._id}"
						{onclick}
						class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-gray-800 hover:text-white"
					>
						<span
							class="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white"
							>+</span
						>
						<span class="truncate">Show more...</span>
					</a>
				</li>
			{/if}
		{/if}
	</ul>
</div>
