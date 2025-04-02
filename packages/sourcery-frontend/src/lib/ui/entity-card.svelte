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
	import personIcon from '$lib/assets/icons/person.svg?raw';
	import organizationIcon from '$lib/assets/icons/organization.svg?raw';
	import locationIcon from '$lib/assets/icons/location.svg?raw';
	import dateIcon from '$lib/assets/icons/date.svg?raw';
	import tagIcon from '$lib/assets/icons/tag.svg?raw';

	let { entity } = $props();
</script>

<a
	href={`/entity/${entity.project_id}/${entity._id}`}
	class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg ring-1 ring-gray-200 dark:ring-white/10 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
>
	<div class="space-y-3">
		<div class="flex flex-row gap-2 items-center">
			<div
				class="bg-blue-100 dark:bg-blue-600/30 text-blue-900 dark:text-blue-200 text-xs font-medium px-2.5 py-1 rounded-md"
			>
				Entity
			</div>
			<div
				class="{entity.type === 'PERSON'
					? 'bg-purple-100 dark:bg-purple-600/30 text-purple-900 dark:text-purple-200'
					: entity.type === 'ORGANIZATION'
						? 'bg-emerald-100 dark:bg-emerald-600/30 text-emerald-900 dark:text-emerald-200'
						: entity.type === 'LOCATION'
							? 'bg-amber-100 dark:bg-amber-600/30 text-amber-900 dark:text-amber-200'
							: entity.type === 'DATE'
								? 'bg-sky-100 dark:bg-sky-600/30 text-sky-900 dark:text-sky-200'
								: 'bg-rose-100 dark:bg-rose-600/30 text-rose-900 dark:text-rose-200'} text-xs font-medium px-2.5 py-1 rounded-md"
			>
				{entity.type}
			</div>
		</div>

		<div class="flex items-center gap-2">
			<div class="text-gray-500 dark:text-gray-400 w-5 h-5">
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
			</div>
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">{entity.value}</h3>
		</div>

		<p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
			{entity.description}
		</p>

		<div class="pt-2 border-t border-gray-200 dark:border-gray-700">
			<span class="text-xs font-medium text-gray-500 dark:text-gray-500">
				{entity.chunk_ids.length} chunk{entity.chunk_ids.length > 1 ? 's' : ''}
			</span>
		</div>
	</div>
</a>
