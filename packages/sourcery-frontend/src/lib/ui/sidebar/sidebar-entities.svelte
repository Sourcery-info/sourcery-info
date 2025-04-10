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

<script lang="ts">
	import { page } from '$app/state';
	import { entitiesStore } from '$lib/stores/entities.store';
	import personIcon from '$lib/assets/icons/person.svg?raw';
	import organizationIcon from '$lib/assets/icons/organization.svg?raw';
	import locationIcon from '$lib/assets/icons/location.svg?raw';
	import dateIcon from '$lib/assets/icons/date.svg?raw';
	import tagIcon from '$lib/assets/icons/tag.svg?raw';

	let { selected_project, onclick } = $props();

	const MAX_ENTITIES = 8;
	let visibleEntities = $derived(
		$entitiesStore
			.slice(0, MAX_ENTITIES)
			.filter((entity) => entity.project_id === selected_project._id)
	);
	let hasMoreEntities = $derived($entitiesStore.length > MAX_ENTITIES);
</script>

<div>
	<div class="text-xs/6 font-semibold text-gray-600 dark:text-gray-400">
		<a href="/entity/{selected_project._id}" {onclick}>Entities</a>
	</div>
	<ul role="list" class="-mx-2 mt-2 space-y-0">
		{#if $entitiesStore.length > 0}
			{#each visibleEntities as entity}
				<li>
					<a
						href={`/entity/${selected_project._id}/${entity._id}`}
						{onclick}
						class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-regular text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white {entity._id ===
						page.params.entity_id
							? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
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
						class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
					>
						<span
							class="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-[0.625rem] font-medium text-gray-600 group-hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:text-white"
							>+</span
						>
						<span class="truncate">Show more...</span>
					</a>
				</li>
			{/if}
		{/if}
	</ul>
</div>
