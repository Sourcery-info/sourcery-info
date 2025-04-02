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
	import { filesStore } from '$lib/stores/files.store';
	import { enhance } from '$app/forms';

	export let data;

	/**
	 * Checks all files.
	 *
	 * @param {Event} e - The event object.
	 */
	function checkAllFiles(e: Event) {
		const checked = (e.target as HTMLInputElement).checked;
		for (let file of $filesStore) {
			if (file._id) {
				filesStore.updateOne(file._id, {
					...file,
					checked
				});
			}
		}
	}
</script>

<div class="p-4">
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
		<!-- Upload Files Card -->
		<div
			class="rounded-lg bg-white dark:bg-white/5 shadow-lg shadow-gray-200/50 dark:shadow-black/50 ring-1 ring-gray-900/5 dark:ring-white/10"
		>
			<div class="border-b border-gray-900/10 dark:border-white/10 px-4 py-3">
				<h3 class="text-base font-semibold text-gray-900 dark:text-white">Upload Files</h3>
			</div>
			<div class="p-4">
				<form method="POST" use:enhance enctype="multipart/form-data">
					<div class="space-y-4">
						<div>
							<label for="files" class="block text-sm font-medium text-gray-900 dark:text-white"
								>File</label
							>
							<input
								multiple={true}
								type="file"
								name="files"
								id="files"
								required
								class="mt-2 block w-full rounded-md border border-gray-900/10 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm placeholder:text-gray-500"
							/>
						</div>
						<button
							type="submit"
							formaction="?/upload"
							class="rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
						>
							Save
						</button>
					</div>
				</form>
			</div>
		</div>
		{#if data.user?.admin}
			<!-- Database Card -->
			<div
				class="rounded-lg bg-white dark:bg-white/5 shadow-lg shadow-gray-200/50 dark:shadow-black/50 ring-1 ring-gray-900/5 dark:ring-white/10"
			>
				<div class="border-b border-gray-900/10 dark:border-white/10 px-4 py-3">
					<h3 class="text-base font-semibold text-gray-900 dark:text-white">Database</h3>
				</div>
				<div class="p-4">
					<div>
						{#if data.props.db_info?.status === 'green'}
							<span
								class="inline-flex items-center rounded-md bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-400/20"
								>Green</span
							>
						{:else if data.props.db_info?.status === 'yellow'}
							<span
								class="inline-flex items-center rounded-md bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-400 ring-1 ring-inset ring-yellow-400/20"
								>Yellow</span
							>
						{:else if data.props.db_info?.status === 'red'}
							<span
								class="inline-flex items-center rounded-md bg-red-400/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-400/20"
								>Red</span
							>
						{:else}
							<span
								class="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20"
								>Unknown</span
							>
						{/if}

						<ul class="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
							<li>Vectors: {data.props.db_info?.vectors_count}</li>
							<li>Indexed Vectors: {data.props.db_info?.indexed_vectors_count}</li>
							<li>Points: {data.props.db_info?.points_count}</li>
							<li>Segments: {data.props.db_info?.segments_count}</li>
						</ul>
					</div>
				</div>
				<div class="border-t border-gray-900/10 dark:border-white/10 px-4 py-3">
					<form method="POST" use:enhance>
						<button
							type="submit"
							formaction="?/deleteCollection"
							class="rounded-md bg-red-600 dark:bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 dark:hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
						>
							Delete Collection
						</button>
					</form>
				</div>
			</div>
		{/if}

		<!-- Files List Card -->
		<div class="sm:col-span-2">
			<form method="POST" use:enhance>
				<div
					class="rounded-lg bg-white dark:bg-white/5 shadow-lg shadow-gray-200/50 dark:shadow-black/50 ring-1 ring-gray-900/5 dark:ring-white/10"
				>
					<div
						class="flex items-center justify-between border-b border-gray-900/10 dark:border-white/10 px-4 py-3"
					>
						<div class="flex items-center space-x-4">
							<input
								type="checkbox"
								on:click={checkAllFiles}
								class="rounded border-gray-900/10 dark:border-white/10 bg-white dark:bg-white/5 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500"
							/>
							<h3 class="text-base font-semibold text-gray-900 dark:text-white">
								Files ({$filesStore.length} files)
							</h3>
						</div>
						<div class="space-x-2">
							<button
								type="submit"
								formaction="?/reindexFiles"
								class="rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
							>
								Reindex
							</button>
							<button
								type="submit"
								formaction="?/deleteFiles"
								class="rounded-md bg-red-600 dark:bg-red-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 dark:hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
							>
								Delete
							</button>
						</div>
					</div>
					<ul class="divide-y divide-gray-900/10 dark:divide-white/10">
						{#each $filesStore as file}
							<li class="flex items-center justify-between px-4 py-3">
								<div class="flex items-center space-x-3">
									<input
										name="files"
										value={file._id}
										type="checkbox"
										checked={file.checked}
										class="rounded border-gray-900/10 dark:border-white/10 bg-white dark:bg-white/5 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500"
									/>
									<span class="text-sm text-gray-900 dark:text-white">{file.original_name}</span>
								</div>
								<span
									class="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-400/20"
								>
									{file.stage}
								</span>
							</li>
						{/each}
					</ul>
				</div>
			</form>
		</div>
	</div>
</div>
