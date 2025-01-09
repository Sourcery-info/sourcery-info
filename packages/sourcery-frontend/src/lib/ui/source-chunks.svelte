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
			class="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors {!showAll
				? 'flex-shrink-0 w-48'
				: ''}"
		>
			<div class="h-24 overflow-y-auto text-sm text-gray-300 mb-2">
				{truncateToWords(chunk.content || '', 50)}
			</div>
			<div class="text-xs text-gray-500 truncate">
				{chunk.title || 'Untitled Source'}
			</div>
		</a>
	{/each}

	{#if remainingCount > 0 && !showAll}
		<button
			on:click={() => (showAll = true)}
			class="flex-shrink-0 w-48 bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
		>
			<div class="h-24 flex items-center justify-center">
				<div class="text-center">
					<div class="text-3xl font-bold text-gray-400">+{remainingCount}</div>
					<div class="text-sm text-gray-500">more sources</div>
				</div>
			</div>
		</button>
	{/if}
</div>
