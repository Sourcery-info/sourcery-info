<script lang="ts">
	// @ts-nocheck
	/** @type {import('./$types').PageData} */
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import Original from './original.svelte';
	import Entities from './entities.svelte';
	import Pipeline from './pipeline.svelte';
	import Text from './text.svelte';
	import Chunks from './chunks.svelte';
	import Dialog from '$lib/ui/dialog.svelte';
	import HamburgerMenu from '$lib/ui/hamburger-menu.svelte';
	import { filesStore } from '$lib/stores/files.store';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	export let data;

	// Add dropdown state management
	let isDropdownOpen = false;
	function toggleDropdown(event) {
		event.stopPropagation();
		isDropdownOpen = !isDropdownOpen;
	}

	function handleClickOutside(event) {
		const dropdown = document.getElementById('dropdown-menu');
		const button = document.getElementById('dropdown-button');
		if (
			isDropdownOpen &&
			dropdown &&
			button &&
			!dropdown.contains(event.target) &&
			!button.contains(event.target)
		) {
			isDropdownOpen = false;
		}
	}

	// Add tab state management
	const tabs = [
		{ id: 'original', name: 'Original' },
		{ id: 'text', name: 'Text' },
		{ id: 'entities', name: 'Entities' },
		{ id: 'chunks', name: 'Chunks' },
		{ id: 'pipeline', name: 'Pipeline' }
	];

	// Initialize activeTab from URL hash if it exists
	let activeTab = 'original';
	$: if (browser) {
		const hash = window.location.hash.slice(1);
		if (hash && tabs.some((tab) => tab.id === hash)) {
			activeTab = hash;
		}
	}

	const setActiveTab = (tabId) => {
		activeTab = tabId;
		// Update URL without page reload
		if (browser) {
			const url = new URL(window.location);
			url.hash = tabId;
			history.replaceState({}, '', url.toString());
		}
	};

	let showDeleteDialog = false;
	let showErrorDialog = false;
	let errorMessage = '';
	let isReindexing = false;

	function openDeleteDialog() {
		showDeleteDialog = true;
	}

	function closeDeleteDialog() {
		showDeleteDialog = false;
	}

	function closeErrorDialog() {
		showErrorDialog = false;
	}

	async function handleDelete() {
		closeDeleteDialog();
		try {
			const response = await fetch(`/file/${data.props.project_id}/${data.props.file._id}`, {
				method: 'DELETE'
			});
			if (response.ok) {
				filesStore.remove(data.props.file._id);
				goto(`/project/${data.props.project_id}`);
			}
		} catch (err) {
			console.error('Error deleting file:', err);
			showErrorDialog = true;
			errorMessage = 'Failed to delete file';
		}
	}

	async function handleReindex(props) {
		try {
			const response = await fetch(`/file/${props.project_id}/${props.file._id}/reindex`, {
				method: 'GET'
			});
			const data = await response.json();
		} catch (err) {
			console.error('Error reindexing file:', err);
			showErrorDialog = true;
			errorMessage = 'Failed to reindex file';
		}
	}

	$: menuItems = [
		{
			label: 'Reindex',
			icon: `<svg class="mr-3 h-5 w-5 ${isReindexing ? 'animate-spin' : ''}" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0v2.433l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clip-rule="evenodd"/>
			</svg>`,
			onClick: async () => {
				isReindexing = true;
				await handleReindex(data.props);
				await new Promise((resolve) => setTimeout(resolve, 1000));
				isReindexing = false;
			},
			disabled: isReindexing
		},
		{
			label: 'Delete',
			icon: `<svg class="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd"/>
			</svg>`,
			onClick: openDeleteDialog,
			class: 'text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700'
		}
	];

	onMount(() => {
		if (browser) {
			window.addEventListener('click', handleClickOutside);
		}
	});
	onDestroy(() => {
		if (browser) {
			window.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<div class="flex flex-col bg-white dark:bg-gray-900">
	<!-- Header -->
	<div class="flex justify-between items-center p-4 bg-white dark:bg-gray-900 shadow-md">
		<h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
			{data.props.file.original_name}
		</h3>
		<HamburgerMenu {menuItems} />
	</div>

	<!-- Main content area -->
	<div class="flex-1 overflow-y-auto p-4">
		<div class="border-b border-gray-200 dark:border-gray-700">
			<div class="sm:flex sm:items-baseline">
				<div class="mt-4 sm:mt-0">
					<nav class="-mb-px flex space-x-8">
						{#each tabs as tab}
							<a
								href="#"
								on:click|preventDefault={() => setActiveTab(tab.id)}
								class="whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium transition-colors
									{activeTab === tab.id
									? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
									: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'}"
								aria-current={activeTab === tab.id ? 'page' : undefined}
							>
								{tab.name}
							</a>
						{/each}
					</nav>
				</div>
			</div>
		</div>

		<!-- Tab content -->
		<div class="mt-4">
			{#if activeTab === 'original'}
				<Original {data} />
			{:else if activeTab === 'text'}
				<Text {data} />
			{:else if activeTab === 'entities'}
				<Entities {data} />
			{:else if activeTab === 'chunks'}
				<Chunks {data} />
			{:else if activeTab === 'pipeline'}
				<Pipeline {data} />
			{/if}
		</div>
	</div>
</div>

<Dialog
	show={showDeleteDialog}
	title="Delete file"
	message={`Are you sure you want to delete "${data.props.file.original_name}"? This action cannot be undone.`}
	confirmText="Delete"
	confirmClass="bg-red-600 hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400"
	on:close={closeDeleteDialog}
	on:confirm={handleDelete}
/>

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

<style>
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear forwards;
	}

	/* Hide scrollbars for webkit browsers */
	::-webkit-scrollbar {
		width: 0;
		height: 0;
	}

	/* Hide scrollbars for other browsers */
	* {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}

	/* Ensure scrollbars appear when needed */
	.scrollable {
		overflow: auto;
	}
</style>
