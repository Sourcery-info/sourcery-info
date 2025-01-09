<script lang="ts">
	import type { TChunk } from '@sourcery/common/types/Chunks.type';

	export let chunks: TChunk[];
	export let maxDisplay = 5;
	export let project_id: string;

	$: displayChunks = chunks.slice(0, maxDisplay - 1);
	$: remainingCount = Math.max(0, chunks.length - (maxDisplay - 1));

	function truncateToWords(text: string, wordLimit: number): string {
		const words = text.split(/\s+/);
		if (words.length <= wordLimit) return text;
		return words.slice(0, wordLimit).join(' ') + '...';
	}
</script>

<div class="flex gap-2 overflow-x-auto pb-2 mb-2">
	{#each displayChunks as chunk}
		<a
			href={`/chunk/${project_id}/${chunk._id}`}
			class="flex-shrink-0 w-48 bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors"
		>
			<div class="h-24 overflow-y-auto text-sm text-gray-300 mb-2">
				{truncateToWords(chunk.content || '', 50)}
			</div>
			<div class="text-xs text-gray-500 truncate">
				{chunk.title || 'Untitled Source'}
			</div>
		</a>
	{/each}

	{#if remainingCount > 0}
		<div
			class="flex-shrink-0 w-48 bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors"
		>
			<div class="h-24 flex items-center justify-center">
				<div class="text-center">
					<div class="text-3xl font-bold text-gray-400">+{remainingCount}</div>
					<div class="text-sm text-gray-500">more sources</div>
				</div>
			</div>
		</div>
	{/if}
</div>
