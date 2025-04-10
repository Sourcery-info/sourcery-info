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
	import { marked } from 'marked';
	import { baseUrl } from 'marked-base-url';

	let { data } = $props();

	const marked_base_url = `${data.origin}/file/${data.project_id}/${data.chunk?.file_id}/img/`;
	marked.use(baseUrl(marked_base_url));
	let html = $derived(data.chunk?.content ? marked(data.chunk.content) : '');
	let showChildren = $state(false);

	function toggleChildren() {
		showChildren = !showChildren;
	}
</script>

<div class="p-6 max-w-5xl mx-auto">
	{#if data.chunk}
		<div class="space-y-6">
			<div class="space-y-4">
				{#if data.chunk.title}
					<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{data.chunk.title}</h1>
				{/if}

				<div class="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
					{#if data.file}
						<div class="flex items-center gap-2">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							<span>From file:</span>
							<a
								href="/file/{data.project_id}/{data.file._id}"
								class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
							>
								{data.file.original_name || data.file.filename}
							</a>
						</div>
					{/if}

					{#if data.parent}
						<div class="flex items-center gap-2">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M7 16l-4-4m0 0l4-4m-4 4h18"
								/>
							</svg>
							<span>Parent chunk:</span>
							<a
								href="/chunk/{data.project_id}/{data.parent._id}"
								class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-md bg-gray-100/50 dark:bg-gray-800/50 px-2 py-0.5"
							>
								{data.parent.title || 'Untitled Chunk'}
							</a>
						</div>
					{/if}

					{#if data.children && data.children.length > 0}
						<div class="flex gap-2">
							<button
								class="flex items-start gap-2 shrink-0 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-colors cursor-pointer group"
								onclick={toggleChildren}
							>
								<svg
									class="w-4 h-4 mt-1 transition-transform duration-200 {showChildren
										? 'rotate-0'
										: '-rotate-90'}"
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
								<span class="group-hover:text-gray-900 dark:group-hover:text-gray-300">
									{data.children.length} child {data.children.length === 1 ? 'chunk' : 'chunks'}:
								</span>
							</button>
							{#if showChildren}
								<div class="flex gap-2 flex-wrap">
									{#each data.children as child}
										<a
											href="/chunk/{data.project_id}/{child._id}"
											class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-md bg-gray-100/50 dark:bg-gray-800/50 px-2 py-0.5"
										>
											{child.title || 'Untitled Chunk'}
										</a>
									{/each}
								</div>
							{:else}
								<div class="flex gap-2 items-start">
									{#each data.children.slice(0, 3) as child}
										<a
											href="/chunk/{data.project_id}/{child._id}"
											class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-md bg-gray-100/50 dark:bg-gray-800/50 px-2 py-0.5"
										>
											{child.title || 'Untitled Chunk'}
										</a>
									{/each}
									{#if data.children.length > 3}
										<span class="text-gray-500 dark:text-gray-500 mt-0.5">...</span>
									{/if}
								</div>
							{/if}
						</div>
					{/if}

					{#if data.entities && data.entities.length > 0}
						<div class="flex items-start gap-2">
							<svg class="w-4 h-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>Entities:</span>
							<div class="flex gap-2 flex-wrap">
								{#each data.entities as entity}
									<a
										href="/entity/{data.project_id}/{entity._id}"
										class="flex items-center gap-1.5 rounded-md bg-gray-100/50 dark:bg-gray-800/50 px-2 py-0.5"
									>
										<span class="text-gray-700 dark:text-gray-300">{entity.value}</span>
										{#if entity.type}
											<span class="text-xs text-gray-500 dark:text-gray-500">({entity.type})</span>
										{/if}
										{#if entity.description}
											<span class="text-gray-600 dark:text-gray-400 text-xs"
												>- {entity.description}</span
											>
										{/if}
									</a>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>

			<div
				class="prose dark:prose-invert max-w-none bg-gray-100/50 dark:bg-gray-800/50 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700"
			>
				{@html html}
			</div>
		</div>
	{:else}
		<div class="text-gray-600 dark:text-gray-400">Loading...</div>
	{/if}
</div>

<style>
	:global(.prose) {
		@apply prose-headings:text-gray-900 dark:prose-headings:text-gray-100 
               prose-p:text-gray-700 dark:prose-p:text-gray-300 
               prose-a:text-blue-600 dark:prose-a:text-blue-400 
               prose-strong:text-gray-900 dark:prose-strong:text-gray-100 
               prose-code:text-gray-900 dark:prose-code:text-gray-100 
               prose-pre:bg-gray-50/50 dark:prose-pre:bg-gray-900/50
               prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 
               prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-700
               prose-ul:text-gray-700 dark:prose-ul:text-gray-300 
               prose-ol:text-gray-700 dark:prose-ol:text-gray-300 
               prose-li:text-gray-700 dark:prose-li:text-gray-300;
	}
</style>
