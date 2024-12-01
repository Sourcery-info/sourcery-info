<script>
	// @ts-nocheck
	/** @type {import('./$types').PageData} */
	import { onMount, onDestroy } from 'svelte';
	import { connect, subscribe, unsubscribe } from '@sourcery/ws/src/client';
	import { enhance } from '$app/forms';
	export let data;

	/**
	 * Checks all files.
	 *
	 * @param {Event} e - The event object.
	 */
	function checkAllFiles(e) {
		for (let file of data.props.files) {
			// @ts-ignore
			file.checked = e.target?.checked;
		}
		data.props.files = data.props.files;
	}

	onMount(async () => {
		console.log('mounted');
		await connect(data.props.websocket_port);
		try {
			await subscribe(`${data.props.project}-file`, (msg) => {
				const f = data.props.files.find((file) => file.uid === msg.file.uid);
				if (f) {
					Object.assign(f, msg.file);
					data.props.files = data.props.files;
				}
			});
		} catch (error) {
			console.error(error);
		}
	});

	onDestroy(() => {
		try {
			unsubscribe('files');
		} catch (error) {
			console.error(error);
		}
	});
</script>

<div class="p-4">
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
		<!-- Upload Files Card -->
		<div class="rounded-lg bg-white/5 shadow-sm ring-1 ring-white/10">
			<div class="border-b border-white/10 px-4 py-3">
				<h3 class="text-base font-semibold text-white">Upload Files</h3>
			</div>
			<div class="p-4">
				<form method="POST" use:enhance enctype="multipart/form-data">
					<div class="space-y-4">
						<div>
							<label for="files" class="block text-sm font-medium text-white">File</label>
							<input
								multiple={true}
								type="file"
								name="files"
								id="files"
								required
								class="mt-2 block w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
							/>
						</div>
						<button
							type="submit"
							formaction="?/upload"
							class="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
						>
							Submit
						</button>
					</div>
				</form>
			</div>
		</div>

		<!-- Database Card -->
		<div class="rounded-lg bg-white/5 shadow-sm ring-1 ring-white/10">
			<div class="border-b border-white/10 px-4 py-3">
				<h3 class="text-base font-semibold text-white">Database</h3>
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

					<ul class="mt-4 space-y-2 text-sm text-gray-300">
						<li>Vectors: {data.props.db_info?.vectors_count}</li>
						<li>Indexed Vectors: {data.props.db_info?.indexed_vectors_count}</li>
						<li>Points: {data.props.db_info?.points_count}</li>
						<li>Segments: {data.props.db_info?.segments_count}</li>
					</ul>
				</div>
			</div>
			<div class="border-t border-white/10 px-4 py-3">
				<form method="POST" use:enhance>
					<button
						type="submit"
						formaction="?/deleteCollection"
						class="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
					>
						Delete Collection
					</button>
				</form>
			</div>
		</div>

		<!-- Files List Card -->
		<div class="sm:col-span-2">
			<form method="POST" use:enhance>
				<div class="rounded-lg bg-white/5 shadow-sm ring-1 ring-white/10">
					<div class="flex items-center justify-between border-b border-white/10 px-4 py-3">
						<div class="flex items-center space-x-4">
							<input
								type="checkbox"
								on:click={checkAllFiles}
								class="rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500"
							/>
							<h3 class="text-base font-semibold text-white">
								Files ({data.props.files.length} files)
							</h3>
						</div>
						<div class="space-x-2">
							<button
								type="submit"
								formaction="?/reindexFiles"
								class="rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
							>
								Reindex
							</button>
							<button
								type="submit"
								formaction="?/deleteFiles"
								class="rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
							>
								Delete
							</button>
						</div>
					</div>
					<ul class="divide-y divide-white/10">
						{#each data.props.files as file}
							<li class="flex items-center justify-between px-4 py-3">
								<div class="flex items-center space-x-3">
									<input
										name="files"
										value={file._id}
										type="checkbox"
										bind:checked={file.checked}
										class="rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500"
									/>
									<span class="text-sm text-white">{file.original_name}</span>
								</div>
								<span
									class="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400 ring-1 ring-inset ring-gray-400/20"
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

<style>
	.file-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
