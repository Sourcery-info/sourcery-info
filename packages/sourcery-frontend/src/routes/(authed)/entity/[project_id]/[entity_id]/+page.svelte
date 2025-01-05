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

<div class="text-white max-w-4xl mx-auto p-6">
	<div class="space-y-4">
		<!-- Header section with badges -->
		<div class="flex flex-row gap-2 items-center">
			<div class="bg-blue-600/30 text-blue-200 text-sm px-2.5 py-1 rounded-md">Entity</div>
			<div
				class="{data.entity.type === 'PERSON'
					? 'bg-purple-600/30 text-purple-200'
					: data.entity.type === 'ORGANIZATION'
						? 'bg-emerald-600/30 text-emerald-200'
						: data.entity.type === 'LOCATION'
							? 'bg-amber-600/30 text-amber-200'
							: data.entity.type === 'DATE'
								? 'bg-sky-600/30 text-sky-200'
								: 'bg-rose-600/30 text-rose-200'} text-sm px-2.5 py-1 rounded-md"
			>
				{data.entity.type}
			</div>
		</div>

		<!-- Entity name with icon -->
		<div class="flex items-center gap-2">
			<div class="text-gray-400 w-6 h-6">
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
			<h1 class="text-2xl font-bold text-white">
				{data.entity.value}
			</h1>
		</div>

		<!-- Description -->
		<p class="text-gray-400 text-lg">
			{data.entity.description}
		</p>

		<!-- Chunks section -->
		<div class="mt-8 space-y-4">
			<div class="text-sm font-medium text-gray-500">
				{data.chunks.length} chunk{data.chunks.length > 1 ? 's' : ''}
			</div>
			{#each data.chunks as chunk}
				<div
					class="bg-gray-800 rounded-lg p-6 shadow-lg hover:bg-gray-700 transition-colors duration-200"
				>
					<div
						class="prose max-w-none bg-gray-50 rounded-lg p-8 shadow-sm overflow-y-auto max-h-[calc(100vh-8rem)] prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:text-lg prose-headings:leading-tight prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:text-lg prose-headings:leading-tight"
					>
						{@html marked(chunk.content)}
					</div>
					<div class="text-md text-gray-400 border-t border-gray-700 pt-3">
						{#if chunk.file}
							<div class="flex items-center gap-2 mb-2">
								<a
									href="/file/{data.entity.project_id}/{chunk.file._id}"
									class="text-blue-400 hover:text-blue-300 transition-colors"
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
