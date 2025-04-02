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
	import { marked } from 'marked';

	export let data;

	import personIcon from '$lib/assets/icons/person.svg?raw';
	import organizationIcon from '$lib/assets/icons/organization.svg?raw';
	import locationIcon from '$lib/assets/icons/location.svg?raw';
	import dateIcon from '$lib/assets/icons/date.svg?raw';
	import tagIcon from '$lib/assets/icons/tag.svg?raw';
</script>

<div class="text-gray-900 dark:text-white max-w-4xl mx-auto p-6">
	<div class="space-y-4">
		<!-- Header section with badges -->
		<div class="flex flex-row gap-2 items-center">
			<div
				class="bg-blue-100 dark:bg-blue-600/30 text-blue-900 dark:text-blue-200 text-sm px-2.5 py-1 rounded-md"
			>
				Entity
			</div>
			<div
				class="{data.entity.type === 'PERSON'
					? 'bg-purple-100 dark:bg-purple-600/30 text-purple-900 dark:text-purple-200'
					: data.entity.type === 'ORGANIZATION'
						? 'bg-emerald-100 dark:bg-emerald-600/30 text-emerald-900 dark:text-emerald-200'
						: data.entity.type === 'LOCATION'
							? 'bg-amber-100 dark:bg-amber-600/30 text-amber-900 dark:text-amber-200'
							: data.entity.type === 'DATE'
								? 'bg-sky-100 dark:bg-sky-600/30 text-sky-900 dark:text-sky-200'
								: 'bg-rose-100 dark:bg-rose-600/30 text-rose-900 dark:text-rose-200'} text-sm px-2.5 py-1 rounded-md"
			>
				{data.entity.type}
			</div>
		</div>

		<!-- Entity name with icon -->
		<div class="flex items-center gap-2">
			<div class="text-gray-500 dark:text-gray-400 w-6 h-6">
				{#if data.entity.type === 'PERSON'}
					{@html personIcon}
				{:else if data.entity.type === 'ORGANIZATION'}
					{@html organizationIcon}
				{:else if data.entity.type === 'LOCATION'}
					{@html locationIcon}
				{:else if data.entity.type === 'DATE'}
					{@html dateIcon}
				{:else}
					{@html tagIcon}
				{/if}
			</div>
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
				{data.entity.value}
			</h1>
		</div>

		<!-- Description -->
		<p class="text-gray-600 dark:text-gray-400 text-lg">
			{data.entity.description}
		</p>

		<!-- Chunks section -->
		<div class="mt-8 space-y-4">
			<div class="text-sm font-medium text-gray-500 dark:text-gray-500">
				{data.chunks.length} chunk{data.chunks.length > 1 ? 's' : ''}
			</div>
			{#each data.chunks as chunk}
				<div
					class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-lg ring-1 ring-gray-200 dark:ring-white/10 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
				>
					<div
						class="prose dark:prose-invert max-w-none bg-white dark:bg-gray-900 rounded-lg p-8 shadow-sm overflow-y-auto max-h-[calc(100vh-8rem)]"
					>
						{@html marked(chunk.content)}
					</div>
					<div
						class="text-md text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3"
					>
						{#if chunk.file}
							<div class="flex items-center gap-2 mb-2">
								<a
									href="/file/{data.entity.project_id}/{chunk.file._id}"
									class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
								>
									{chunk.file.original_name}
								</a>
							</div>
						{/if}
						{chunk.context}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
