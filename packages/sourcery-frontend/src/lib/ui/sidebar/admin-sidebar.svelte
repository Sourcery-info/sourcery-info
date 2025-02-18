<script lang="ts">
	// @ts-nocheck
	/** @type {import('./$types').PageData} */
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	import logoSvg from '$lib/assets/Sourcery.svg?raw';
	import personIcon from '$lib/assets/icons/person.svg?raw';
	import settingsIcon from '$lib/assets/icons/settings.svg?raw';
	import lightningIcon from '$lib/assets/icons/lightning.svg?raw';
	import folderIcon from '$lib/assets/icons/folder.svg?raw';
	import fileIcon from '$lib/assets/icons/file.svg?raw';
	import mailIcon from '$lib/assets/icons/mail.svg?raw';

	function handleItemClick() {
		dispatch('menuItemClick');
	}
</script>

<div class="relative h-full">
	<div class="flex h-full flex-col bg-white dark:bg-gray-900 px-6">
		<div class="flex h-16 flex-shrink-0 items-center gap-x-3 mb-4">
			<a href="/" onclick={handleItemClick}>
				<div class="h-6">
					<div
						class="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current text-gray-900 dark:text-white"
					>
						{@html logoSvg}
					</div>
				</div>
			</a>
			<div class="relative flex-1">
				<a
					href="/"
					class="flex w-full items-center justify-between gap-x-1 text-base font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
				>
					Sourcery.info
				</a>
				<div
					class="inline-flex items-center rounded-full bg-gray-200/50 dark:bg-gray-800/50 px-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-400/75"
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
					class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
				>
					{@html personIcon}
					<span>Users</span>
				</a>
				<a
					href="/admin/memberships"
					onclick={handleItemClick}
					class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
				>
					{@html lightningIcon}
					<span>Memberships</span>
				</a>
				<a
					href="/admin/invites"
					onclick={handleItemClick}
					class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
				>
					{@html mailIcon}
					<span>Invite Codes</span>
				</a>
				<a
					href="/admin/projects/list"
					onclick={handleItemClick}
					class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
				>
					{@html folderIcon}
					<span>Projects</span>
				</a>
				<a
					href="/admin/terms"
					onclick={handleItemClick}
					class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
				>
					{@html fileIcon}
					<span>Terms & Conditions</span>
				</a>
				<a
					href="/admin/privacy"
					onclick={handleItemClick}
					class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
				>
					{@html fileIcon}
					<span>Privacy Policy</span>
				</a>
				<a
					href="/admin/config"
					onclick={handleItemClick}
					class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
				>
					{@html settingsIcon}
					<span>Configuration</span>
				</a>
				<a
					href="/settings"
					onclick={handleItemClick}
					class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
				>
					{@html lightningIcon}
					<span>AI Settings</span>
				</a>
			</ul>
		</nav>
	</div>
</div>
