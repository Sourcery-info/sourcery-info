<script lang="ts">
	import { onMount } from 'svelte';
	import { filesStore } from '$lib/stores/files';
	export let data: any;

	let file: any = {};
	let queued_stages: string[] = [];
	let processing_stage: string | null = null;
	let completed_stages: string[] = [];

	let expanded: Record<string, boolean> = {
		queued: true,
		processing: true,
		completed: true
	};

	$: if (data.props.file) {
		const files = $filesStore;
		file = files.find((f) => f._id === data.props.file._id);
		if (file) {
			queued_stages = file.stage_queue.filter((stage: string) => stage !== 'done');
			processing_stage = file.stage !== 'done' ? file.stage : null;
			completed_stages = file.completed_stages.filter((stage: string) => stage !== 'done');
		}
		console.log({ file, queued_stages, processing_stage, completed_stages });
	}

	function toggleSection(section: string) {
		expanded[section] = !expanded[section];
	}

	async function reindexFromStage(stage: string) {
		await fetch(`/file/${data.props.project_id}/${data.props.file._id}/reindex/stage/${stage}`);
	}
</script>

<div class="p-6">
	<h1 class="text-2xl font-bold mb-6">Pipeline</h1>

	<div class="mb-4 border border-gray-700 rounded-lg overflow-hidden">
		<button
			class="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 flex justify-between items-center"
			on:click={() => toggleSection('completed')}
		>
			<h2 class="text-lg font-semibold">Completed ({completed_stages?.length || 0})</h2>
			<svg
				class="w-5 h-5 transform transition-transform {expanded.completed ? 'rotate-180' : ''}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>
		{#if expanded.completed && completed_stages?.length}
			<div class="p-4 bg-gray-900">
				<div class="grid grid-cols-1 gap-3">
					{#each completed_stages as stage, i}
						<div
							class="bg-gray-800 rounded p-2 hover:bg-gray-700 transition-colors flex items-center justify-between"
						>
							<div class="flex items-center">
								<span
									class="inline-flex items-center justify-center bg-gray-700 rounded-full w-6 h-6 mr-3 text-sm"
								>
									{i + 1}
								</span>
								{stage}
							</div>
							<button
								class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
								on:click={() => reindexFromStage(stage)}
							>
								Reindex
							</button>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<div class="mb-4 border border-gray-700 rounded-lg overflow-hidden">
		<button
			class="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 flex justify-between items-center"
			on:click={() => toggleSection('processing')}
		>
			<h2 class="text-lg font-semibold">Processing {processing_stage ? '(1)' : '(0)'}</h2>
			<svg
				class="w-5 h-5 transform transition-transform {expanded.processing ? 'rotate-180' : ''}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>
		{#if expanded.processing && processing_stage}
			<div class="p-4 bg-gray-900">
				<div class="grid grid-cols-1 gap-3">
					<div
						class="bg-gray-800 rounded p-2 hover:bg-gray-700 transition-colors flex items-center justify-between"
					>
						<div class="flex items-center">
							<span
								class="inline-flex items-center justify-center bg-gray-700 rounded-full w-6 h-6 mr-3 text-sm"
							>
								1
							</span>
							{processing_stage}
						</div>
						<button
							class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
							on:click={() => reindexFromStage(processing_stage || '')}
						>
							Reindex
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<div class="mb-4 border border-gray-700 rounded-lg overflow-hidden">
		<button
			class="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 flex justify-between items-center"
			on:click={() => toggleSection('queued')}
		>
			<h2 class="text-lg font-semibold">Queued ({queued_stages?.length || 0})</h2>
			<svg
				class="w-5 h-5 transform transition-transform {expanded.queued ? 'rotate-180' : ''}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>
		{#if expanded.queued && queued_stages?.length}
			<div class="p-4 bg-gray-900">
				<div class="grid grid-cols-1 gap-3">
					{#each queued_stages as stage, i}
						<div
							class="bg-gray-800 rounded p-2 hover:bg-gray-700 transition-colors flex items-center"
						>
							<span
								class="inline-flex items-center justify-center bg-gray-700 rounded-full w-6 h-6 mr-3 text-sm"
							>
								{i + 1}
							</span>
							{stage}
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
