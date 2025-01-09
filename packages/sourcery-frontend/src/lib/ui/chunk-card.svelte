<script lang="ts">
	import type { TChunk } from '@sourcery/common/types/Chunks.type';
	import { createEventDispatcher, onMount } from 'svelte';
	const dispatch = createEventDispatcher();

	export let chunk: TChunk;
	export let showParent = false;
	export let level = 0;

	let isParentExpanded = false;
	let isChildrenExpanded = false;
	let containerElement: HTMLElement;

	function toggleParent() {
		isParentExpanded = !isParentExpanded;
		if (isParentExpanded) {
			dispatch('loadParent', { parentId: chunk.parent });
		}
	}

	function toggleChildren() {
		isChildrenExpanded = !isChildrenExpanded;
	}

	function truncateToWords(text: string, wordLimit: number): string {
		const words = text.split(/\s+/);
		if (words.length <= wordLimit) return text;
		return words.slice(0, wordLimit).join(' ') + '...';
	}

	$: displayContent = truncateToWords(chunk.content || '', 100);

	onMount(() => {
		// Set CSS variable for child width based on the chunk content width
		if (containerElement) {
			const chunkWidth = containerElement.querySelector('.chunk-content')?.clientWidth || 300;
			containerElement.style.setProperty('--child-width', `${chunkWidth}px`);
		}
	});
</script>

<div class="chunk-tree-container" bind:this={containerElement}>
	<div class="chunk-node">
		<div
			class="chunk-content bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 hover:border-gray-600 transition-colors"
		>
			{#if chunk.title}
				<h3 class="text-lg font-semibold text-white mb-2">{chunk.title}</h3>
			{/if}
			<p class="text-gray-300">{displayContent}</p>
		</div>

		{#if chunk.children && chunk.children.length > 0}
			<div class="connector-wrapper">
				<div class="connector-line"></div>
				<button
					class="expand-button bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white w-6 h-6 rounded-full border-2 border-gray-600 flex items-center justify-center transition-colors"
					on:click={toggleChildren}
					aria-label={isChildrenExpanded ? 'Collapse children' : 'Expand children'}
				>
					<svg
						class="w-4 h-4 transform transition-transform {isChildrenExpanded ? 'rotate-180' : ''}"
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
			</div>
		{/if}
	</div>

	{#if isChildrenExpanded && chunk.children}
		<div class="children-container">
			{#each chunk.children as child, i (child.id)}
				<div class="child-branch">
					<svelte:self chunk={child} level={level + 1} />
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="postcss">
	.chunk-tree-container {
		@apply flex flex-col items-center;
		position: relative;
	}

	.chunk-node {
		@apply flex flex-col items-center min-w-[300px] max-w-xl relative;
	}

	.connector-wrapper {
		@apply flex flex-col items-center relative;
		height: 48px;
	}

	.children-container {
		@apply flex flex-row gap-16;
		position: relative;
		padding: 0 calc(var(--child-width) / 4);
	}

	.children-container::before {
		content: '';
		@apply absolute bg-gray-600;
		height: 2px;
		top: -24px;
		/* Position the line to start at first child's center and end at last child's center */
		left: calc(var(--child-width) * 0.75);
		right: calc(var(--child-width) * 0.75);
	}

	.child-branch {
		@apply flex flex-col items-center;
		position: relative;
		/* Set a consistent width for child branches */
		width: var(--child-width);
		min-width: min-content;
	}

	.child-branch::before {
		content: '';
		@apply absolute bg-gray-600;
		width: 2px;
		height: 24px;
		top: -24px;
		left: 50%;
		transform: translateX(-50%);
	}

	.connector-line {
		@apply bg-gray-600;
		position: absolute;
		width: 2px;
		height: 24px;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
	}

	.expand-button {
		position: absolute;
		top: 12px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 10;
	}

	/* Remove horizontal line for single child */
	.children-container:has(.child-branch:only-child)::before {
		display: none;
	}
</style>
