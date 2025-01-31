<script lang="ts">
	// @ts-nocheck
	/** @type {import('./$types').PageData} */
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	import logo from '$lib/assets/Sourcery Logo.png';
	import personIcon from '$lib/assets/icons/person.svg?raw';
	import settingsIcon from '$lib/assets/icons/settings.svg?raw';
	import lightningIcon from '$lib/assets/icons/lightning.svg?raw';
	import folderIcon from '$lib/assets/icons/folder.svg?raw';
	import fileIcon from '$lib/assets/icons/file.svg?raw';

	function handleItemClick() {
		dispatch('menuItemClick');
	}
</script>

<div class="relative h-full">
	<div class="flex h-full flex-col bg-gray-900 px-6">
		<div class="flex h-16 flex-shrink-0 items-center gap-x-3 mb-4">
			<a href="/" onclick={handleItemClick}>
				<img class="h-8 w-auto" src={logo} alt="Sourcery.info Logo" />
			</a>
			<div class="relative flex-1">
				<a
					href="/"
					class="flex w-full items-center justify-between gap-x-1 text-base font-semibold text-gray-100 hover:text-white"
				>
					Sourcery.info
				</a>
				<div
					class="inline-flex items-center rounded-full bg-gray-700/50 px-2 py-0.5 text-xs font-medium text-gray-300 ring-1 ring-inset ring-gray-500/75"
				>
					Admin
				</div>
			</div>
		</div>
		<nav class="flex-grow-1 flex flex-1 flex-col">
			<ul role="list" class="flex flex-1 flex-col gap-y-7">
				<a
					href="/admin/users/list"
					onclick={handleItemClick}
					class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-gray-800 hover:text-white"
				>
					{@html personIcon}
					<span>Users</span>
				</a>
				<a
					href="/admin/projects/list"
					onclick={handleItemClick}
					class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-gray-800 hover:text-white"
				>
					{@html folderIcon}
					<span>Projects</span>
				</a>
				<a
					href="/admin/terms"
					onclick={handleItemClick}
					class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-gray-800 hover:text-white"
				>
					{@html fileIcon}
					<span>Terms & Conditions</span>
				</a>
				<a
					href="/admin/config"
					onclick={handleItemClick}
					class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-gray-800 hover:text-white"
				>
					{@html settingsIcon}
					<span>Configuration</span>
				</a>
				<a
					href="/settings"
					onclick={handleItemClick}
					class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-gray-800 hover:text-white"
				>
					{@html lightningIcon}
					<span>AI Settings</span>
				</a>
			</ul>
		</nav>
	</div>
</div>
