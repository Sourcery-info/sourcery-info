<script lang="ts">
	import { page } from '$app/state';
	import { filesStore } from '$lib/stores/files';
	import { FileStatus } from '@sourcery/common/types/SourceryFile.type';

	let { selected_project, onclick } = $props();

	async function handleFileUpload(event: Event) {
		const uploaded_files = (event.target as HTMLInputElement).files;
		if (!uploaded_files) return;

		const formData = new FormData();
		for (const uploaded_file of uploaded_files) {
			formData.append('files', uploaded_file);
		}

		const res = await fetch(`/files/${selected_project._id}/upload`, {
			method: 'POST',
			body: formData
		});

		if (res.ok) {
			const res_json = await res.json();
			filesStore.update((files) => [...files, ...res_json.files]);
		}
		if (event.target) {
			(event.target as HTMLInputElement).value = '';
		}
	}
</script>

<div>
	<div class="text-xs/6 font-semibold text-gray-400">
		<a href="/files/{selected_project._id}" {onclick}>Files</a>
	</div>
	<ul role="list" class="-mx-2 mt-2 space-y-1 max-h-[40vh] overflow-y-auto">
		<li>
			<label
				class="group flex w-full cursor-pointer items-center gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-gray-800 hover:text-white"
			>
				<svg
					class="size-6 shrink-0"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					aria-hidden="true"
					data-slot="icon"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
				</svg>
				<span>Upload Files</span>
				<input
					type="file"
					multiple
					class="hidden"
					onchange={handleFileUpload}
					accept=".txt,.pdf,.doc,.docx"
				/>
			</label>
		</li>
		{#if $filesStore.length > 0}
			{#each $filesStore as file}
				<li>
					<a
						href={`/file/${selected_project._id}/${file._id}`}
						{onclick}
						class="group flex w-full items-center gap-x-3 rounded-md p-2 text-sm/6 font-regular
                            {file._id === page.params.file_id
							? 'bg-gray-800 text-white'
							: 'text-gray-400 hover:bg-gray-800 hover:text-white'}"
					>
						{#if file.status === FileStatus.PROCESSING}
							<svg
								class="size-5 shrink-0 animate-spin text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								/>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
						{:else if file.status === FileStatus.PENDING}
							<svg
								class="size-5 shrink-0 text-yellow-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						{:else if file.status === FileStatus.ERROR}
							<svg
								class="size-5 shrink-0 text-red-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
								/>
							</svg>
						{:else}
							<svg
								class="size-5 shrink-0 {file.status === FileStatus.ACTIVE
									? 'text-green-400'
									: 'text-gray-400'}"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
								/>
							</svg>
						{/if}
						<span class="truncate">{file.original_name || file.filename}</span>
					</a>
					{#if file.status === FileStatus.PROCESSING}
						{@const totalStages = file.completed_stages.length + file.stage_queue.length + 1}
						{@const completedStages = file.completed_stages.length}
						{@const progress = (completedStages / totalStages) * 100}
						<div class="progress-bar mx-2">
							<div class="progress-bar-fill" style="width: {progress}%"></div>
						</div>
					{/if}
				</li>
			{/each}
		{/if}
	</ul>
</div>

<style>
	.progress-bar {
		@apply h-1 bg-gray-700 rounded-full overflow-hidden mt-1;
	}
	.progress-bar-fill {
		@apply h-full bg-blue-500 transition-all duration-300;
	}
</style>
