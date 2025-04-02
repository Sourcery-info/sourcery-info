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
	// @ts-nocheck
	/** @type {import('./$types').PageData} */
	export let data;

	import EntityCard from '$lib/ui/entity-card.svelte';

	let selectedType: string | null = null;
	$: filteredEntities = selectedType
		? data.entities.filter((entity) => entity.type === selectedType)
		: data.entities;

	const entityTypes = ['PERSON', 'ORGANIZATION', 'LOCATION', 'DATE'];
</script>

<div class="min-h bg-white dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
	<div class="max-w-7xl mx-auto">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">
			Entities for Project {data.project.name}
		</h1>
		<p class="text-gray-600 dark:text-gray-400 text-sm mb-8">
			{data.entities.length} entit{data.entities.length === 1 ? 'y' : 'ies'}
		</p>
		<div class="flex gap-2 mb-6 flex-wrap">
			<button
				class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
					{selectedType === null
					? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
					: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}"
				on:click={() => (selectedType = null)}
			>
				All
			</button>
			{#each entityTypes as type}
				<button
					class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
						{selectedType === type
						? type === 'PERSON'
							? 'bg-purple-100 dark:bg-purple-600/30 text-purple-900 dark:text-purple-200'
							: type === 'ORGANIZATION'
								? 'bg-emerald-100 dark:bg-emerald-600/30 text-emerald-900 dark:text-emerald-200'
								: type === 'LOCATION'
									? 'bg-amber-100 dark:bg-amber-600/30 text-amber-900 dark:text-amber-200'
									: 'bg-sky-100 dark:bg-sky-600/30 text-sky-900 dark:text-sky-200'
						: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}"
					on:click={() => (selectedType = type)}
				>
					{type}
				</button>
			{/each}
		</div>

		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredEntities as entity}
				<EntityCard {entity} />
			{/each}
		</div>
	</div>
</div>
