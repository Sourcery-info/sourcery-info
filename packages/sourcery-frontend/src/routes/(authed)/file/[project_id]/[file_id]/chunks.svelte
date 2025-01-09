<script lang="ts">
	import type { TChunk } from '@sourcery/common/types/Chunks.type';
	import ChunkCard from '$lib/ui/chunk-card.svelte';
	export let data: any;

	let chunk: TChunk;
	let parentChunks: Map<string, TChunk> = new Map();

	async function loadChunks() {
		const res = await fetch(`/file/${data.props.project_id}/${data.props.file._id}/view/chunks`);
		chunk = await res.json();
	}

	async function handleLoadParent(event: CustomEvent<{ parentId: string }>) {
		if (!parentChunks.has(event.detail.parentId)) {
			const res = await fetch(
				`/file/${data.props.project_id}/${data.props.file._id}/chunk/${event.detail.parentId}`
			);
			const parentChunk = await res.json();
			parentChunks.set(event.detail.parentId, parentChunk);
		}
	}

	$: {
		if (data?.props?.file?._id && !chunk?.id) {
			loadChunks();
		}
	}
</script>

<div class="p-4">
	<h1 class="text-2xl font-bold text-white mb-8">Chunks</h1>
	{#if chunk}
		<div class="overflow-x-auto pb-8">
			<div class="min-w-full inline-block">
				<div class="flex justify-center">
					<ChunkCard {chunk} on:loadParent={handleLoadParent} />
				</div>
			</div>
		</div>
	{:else}
		<div class="text-gray-400">Loading...</div>
	{/if}
</div>

<style>
	/* Enable smooth scrolling for the overflow container */
	.overflow-x-auto {
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
	}
</style>
