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
	import type { TChunk } from '@sourcery/common/types/Chunks.type';

	export let chunks: TChunk[];
	export let maxDisplay = 4;
	export let project_id: string;

	let showAll = false;

	$: displayChunks = showAll ? chunks : chunks.slice(0, maxDisplay - 1);
	$: remainingCount = Math.max(0, chunks.length - (maxDisplay - 1));

	function truncateToWords(text: string, wordLimit: number): string {
		const words = text.split(/\s+/);
		if (words.length <= wordLimit) return text;
		return words.slice(0, wordLimit).join(' ') + '...';
	}
</script>

<div
	class={showAll
		? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
		: 'flex gap-2 overflow-x-auto pb-2 mb-2'}
>
	{#each displayChunks as chunk}
		<a
			href={`/chunk/${project_id}/${chunk._id}`}
			class="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors {!showAll
				? 'flex-shrink-0 w-48'
				: ''}"
		>
			<div class="h-24 overflow-y-auto text-sm text-gray-700 dark:text-gray-300 mb-2">
				{truncateToWords(chunk.content || '', 50)}
			</div>
			<div class="text-xs text-gray-500 dark:text-gray-500 truncate">
				{chunk.title || 'Untitled Source'}
			</div>
		</a>
	{/each}

	{#if remainingCount > 0 && !showAll}
		<button
			on:click={() => (showAll = true)}
			class="flex-shrink-0 w-48 bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
		>
			<div class="h-24 flex items-center justify-center">
				<div class="text-center">
					<div class="text-3xl font-bold text-gray-500 dark:text-gray-400">+{remainingCount}</div>
					<div class="text-sm text-gray-500 dark:text-gray-500">more sources</div>
				</div>
			</div>
		</button>
	{/if}
</div>
