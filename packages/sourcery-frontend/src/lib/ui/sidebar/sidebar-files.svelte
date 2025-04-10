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
	import { page } from '$app/state';
	import { filesStore } from '$lib/stores/files.store';
	import { FileStatus } from '@sourcery/common/types/SourceryFile.type';
	import plusIcon from '$lib/assets/icons/plus.svg?raw';
	import spinnerIcon from '$lib/assets/icons/spinner.svg?raw';
	import pendingIcon from '$lib/assets/icons/pending.svg?raw';
	import errorIcon from '$lib/assets/icons/error.svg?raw';
	import fileIcon from '$lib/assets/icons/file.svg?raw';
	import Toggle from '$lib/ui/toggle.svelte';

	let { selected_project, onclick, user } = $props();

	async function toggleFileStatus(file: any, event: Event) {
		event.preventDefault();
		event.stopPropagation();
		const newStatus = file.status === FileStatus.ACTIVE ? FileStatus.INACTIVE : FileStatus.ACTIVE;

		const res = await fetch(`/file/${selected_project._id}/${file._id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ status: newStatus })
		});

		if (res.ok) {
			filesStore.upsert({ ...file, status: newStatus });
		}
	}

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
			for (const file of res_json.files) {
				filesStore.upsert(file);
			}
		}
		if (event.target) {
			(event.target as HTMLInputElement).value = '';
		}
	}

	const is_owner = $derived(selected_project.owner === user?.user_id);
</script>

<div>
	<div class="text-xs/6 font-semibold text-gray-600 dark:text-gray-400">
		{#if is_owner}
			<a href="/files/{selected_project._id}" {onclick}>Files</a>
		{:else}
			Files
		{/if}
	</div>
	<ul role="list" class="-mx-2 mt-2 space-y-0 max-h-[40vh] overflow-y-auto">
		{#if is_owner}
			<li>
				<label
					class="group flex w-full cursor-pointer items-center gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
				>
					{@html plusIcon}
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
		{/if}
		{#if $filesStore.length > 0}
			{#if is_owner}
				{#each $filesStore.filter((file) => file.project === selected_project._id) as file}
					<li>
						<a
							href={`/file/${selected_project._id}/${file._id}`}
							{onclick}
							class="group flex w-full items-center gap-x-3 rounded-md p-2 text-sm/6 font-regular
								{file._id === page.params.file_id
								? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
								: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'}"
						>
							<div class="flex items-center gap-x-3 min-w-0 flex-1">
								{#if file.status === FileStatus.PROCESSING}
									{@html spinnerIcon}
								{:else if file.status === FileStatus.PENDING}
									{@html pendingIcon}
								{:else if file.status === FileStatus.ERROR}
									{@html errorIcon}
								{:else}
									{@html fileIcon}
								{/if}
								<span class="truncate">{file.original_name || file.filename}</span>
							</div>
							{#if file.status === FileStatus.ACTIVE || file.status === FileStatus.INACTIVE}
								<Toggle
									checked={file.status === FileStatus.ACTIVE}
									onChange={(e) => toggleFileStatus(file, e)}
									label={`Toggle file active status for ${file.original_name || file.filename} - currently ${file.status}`}
								/>
							{/if}
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
			{:else}
				{#each $filesStore.filter((file) => file.project === selected_project._id && file.status === FileStatus.ACTIVE) as file}
					<li>
						<a
							href={`/file/${selected_project._id}/${file._id}`}
							{onclick}
							class="text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
						>
							<div class="flex items-center gap-x-3 min-w-0 flex-1">
								{@html fileIcon}
								<span class="truncate">{file.original_name || file.filename}</span>
							</div>
						</a>
					</li>
				{/each}
			{/if}
		{/if}
	</ul>
</div>

<style>
	.progress-bar {
		@apply h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1;
	}
	.progress-bar-fill {
		@apply h-full bg-indigo-600 dark:bg-blue-500 transition-all duration-300;
	}
</style>
