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
	<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">Chunks</h1>
	{#if chunk}
		<div class="overflow-x-auto pb-8">
			<div class="min-w-full inline-block">
				<div class="flex justify-center">
					<ChunkCard {chunk} on:loadParent={handleLoadParent} />
				</div>
			</div>
		</div>
	{:else}
		<div class="text-gray-500 dark:text-gray-400">Loading...</div>
	{/if}
</div>

<style>
	/* Enable smooth scrolling for the overflow container */
	.overflow-x-auto {
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
	}
</style>
