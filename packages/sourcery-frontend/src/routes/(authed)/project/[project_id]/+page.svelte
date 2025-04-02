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
	import { goto } from '$app/navigation';
	import Dialog from '$lib/ui/dialog.svelte';
	import HamburgerMenu from '$lib/ui/hamburger-menu.svelte';

	export let data;

	let showDeleteDialog = false;
	let showErrorDialog = false;
	let errorMessage = '';
	let confirmProjectName = '';

	function openDeleteDialog() {
		showDeleteDialog = true;
		confirmProjectName = '';
	}

	function closeDeleteDialog() {
		showDeleteDialog = false;
		confirmProjectName = '';
	}

	function closeErrorDialog() {
		showErrorDialog = false;
	}

	async function handleDelete() {
		if (confirmProjectName !== data.project.name) {
			errorMessage = 'Project name does not match';
			showErrorDialog = true;
			return;
		}
		closeDeleteDialog();
		try {
			const response = await fetch(`/project/${data.project._id}`, {
				method: 'DELETE'
			});
			if (response.ok) {
				goto('/projects');
			} else {
				throw new Error('Failed to delete project');
			}
		} catch (err) {
			console.error('Error deleting project:', err);
			showErrorDialog = true;
			errorMessage = 'Failed to delete project';
		}
	}

	$: menuItems = [
		{
			label: 'Delete',
			icon: `<svg class="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd"/>
			</svg>`,
			onClick: openDeleteDialog,
			class: 'text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700'
		}
	];

	async function handleFileUpload(event: Event) {
		const uploaded_files = (event.target as HTMLInputElement).files;
		if (!uploaded_files) return;

		const formData = new FormData();
		for (const uploaded_file of uploaded_files) {
			formData.append('files', uploaded_file);
		}

		const res = await fetch(`/files/${data.project._id}/upload`, {
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

	$: is_owner = data.project.owner === data.user?.user_id;
</script>

<div class="min-h-full bg-white dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
	<div class="max-w-7xl mx-auto">
		<div class="flex items-center justify-between mb-8">
			<div>
				<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{data.project.name}</h1>
				{#if data.project.description}
					<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{data.project.description}</p>
				{/if}
			</div>
			<div class="flex items-center gap-4">
				{#if data.project.is_public}
					<span
						class="inline-flex items-center rounded-md bg-green-50 dark:bg-green-400/10 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/20"
					>
						Public
					</span>
				{/if}
				{#if is_owner}
					<HamburgerMenu {menuItems} />
				{/if}
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#if $filesStore.length === 0}
				<!-- New Project Card -->
				<label
					class="group relative flex flex-col justify-center items-center rounded-lg bg-gray-50 dark:bg-gray-800/30 p-6 ring-1 ring-gray-200 dark:ring-white/10 hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer"
				>
					<div
						class="h-12 w-12 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6 text-white"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
						</svg>
					</div>
					<h3 class="mt-4 text-lg font-semibold leading-6 text-gray-900 dark:text-white">
						Upload Files
					</h3>
					<p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
						Get started by uploading your first file
					</p>
					<input
						type="file"
						multiple
						class="hidden"
						on:change={handleFileUpload}
						accept=".txt,.pdf,.doc,.docx"
					/>
				</label>
			{:else}
				<!-- New Conversation Card -->
				<a
					href="/chat/{data.project._id}"
					class="group relative flex flex-col justify-center items-center rounded-lg bg-gray-50 dark:bg-gray-800/30 p-6 ring-1 ring-gray-200 dark:ring-white/10 hover:bg-gray-100 dark:hover:bg-gray-800/50"
				>
					<div
						class="h-12 w-12 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6 text-white"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
							/>
						</svg>
					</div>
					<h3 class="mt-4 text-lg font-semibold leading-6 text-gray-900 dark:text-white">
						New Conversation
					</h3>
					<p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
						Start a new chat about your project
					</p>
				</a>

				<!-- View Files Card -->
				<a
					href="/files/{data.project._id}"
					class="group relative flex flex-col justify-center items-center rounded-lg bg-gray-50 dark:bg-gray-800/30 p-6 ring-1 ring-gray-200 dark:ring-white/10 hover:bg-gray-100 dark:hover:bg-gray-800/50"
				>
					<div
						class="h-12 w-12 rounded-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6 text-white"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
							/>
						</svg>
					</div>
					<h3 class="mt-4 text-lg font-semibold leading-6 text-gray-900 dark:text-white">Files</h3>
					<p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
						View and manage your project files
					</p>
				</a>

				<!-- Explore Entities Card -->
				<a
					href="/entity/{data.project._id}"
					class="group relative flex flex-col justify-center items-center rounded-lg bg-gray-50 dark:bg-gray-800/30 p-6 ring-1 ring-gray-200 dark:ring-white/10 hover:bg-gray-100 dark:hover:bg-gray-800/50"
				>
					<div
						class="h-12 w-12 rounded-full bg-purple-600 dark:bg-purple-500 flex items-center justify-center"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6 text-white"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
							/>
						</svg>
					</div>
					<h3 class="mt-4 text-lg font-semibold leading-6 text-gray-900 dark:text-white">
						Entities
					</h3>
					<p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
						Explore extracted entities and insights
					</p>
				</a>
			{/if}
		</div>

		<!-- Project Stats -->
		{#if $filesStore.length > 0}
			<div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
				<div class="bg-gray-400/30 rounded-lg p-6 ring-1 ring-white/10">
					<h3 class="text-sm font-medium text-gray-900 dark:text-white">Files</h3>
					<p class="mt-2 text-3xl font-semibold text-gray-500 dark:text-white">
						{$filesStore.length}
					</p>
				</div>
				<!-- Add more stats as needed -->
			</div>
		{/if}
	</div>
</div>

<Dialog
	show={showDeleteDialog}
	title="Delete project"
	message={`This action cannot be undone. This will permanently delete the project "${data.project.name}" and all of its data.`}
	confirmText="Delete"
	confirmClass="bg-red-600 hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400 {confirmProjectName !==
	data.project.name
		? 'opacity-50 cursor-not-allowed'
		: ''}"
	on:close={closeDeleteDialog}
	on:confirm={() => confirmProjectName === data.project.name && handleDelete()}
>
	<div class="mt-4">
		<label for="confirm-name" class="block text-sm font-medium text-gray-200">
			Please type <span class="font-semibold text-white">{data.project.name}</span> to confirm
		</label>
		<div class="mt-2">
			<input
				type="text"
				id="confirm-name"
				bind:value={confirmProjectName}
				class="block w-full rounded-lg bg-white/5 px-4 py-2.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 transition-colors duration-200 hover:bg-white/10 sm:text-sm sm:leading-6"
				placeholder="Enter project name"
			/>
		</div>
	</div>
</Dialog>

<Dialog
	show={showErrorDialog}
	title="Error"
	message={errorMessage}
	confirmText="Close"
	type="error"
	showCancel={false}
	confirmClass="bg-gray-600 hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600"
	on:close={closeErrorDialog}
	on:confirm={closeErrorDialog}
/>
