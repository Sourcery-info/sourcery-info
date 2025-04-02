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
	// @ts-nocheck
	/** @type {import('./$types').PageData} */
	import { projectsStore } from '$lib/stores/projects.store';
	import { filesStore } from '$lib/stores/files.store';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	import logoSvg from '$lib/assets/Sourcery.svg?raw';
	import chevronDownIcon from '$lib/assets/icons/chevron-down.svg?raw';
	import homeIcon from '$lib/assets/icons/home.svg?raw';
	import settingsIcon from '$lib/assets/icons/settings.svg?raw';
	import SidebarFiles from './sidebar-files.svelte';
	import SidebarEntities from './sidebar-entities.svelte';
	import SidebarConversations from './sidebar-conversations.svelte';

	let { selected_project, user } = $props();

	let showProjectDropdown = $state(false);
	let dropdownRef = $state(null);
	let isDarkMode = $state(false);

	function handleClickOutside(event) {
		if (dropdownRef && !dropdownRef.contains(event.target)) {
			showProjectDropdown = false;
		}
	}

	function handleItemClick() {
		dispatch('menuItemClick');
	}

	import { onMount } from 'svelte';

	onMount(() => {
		document.addEventListener('click', handleClickOutside);

		// Set up dark mode detection
		const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		isDarkMode = darkModeMediaQuery.matches;

		const handleDarkModeChange = (e) => {
			isDarkMode = e.matches;
		};

		darkModeMediaQuery.addEventListener('change', handleDarkModeChange);

		return () => {
			document.removeEventListener('click', handleClickOutside);
			darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
		};
	});

	let is_owner = $derived(selected_project?.owner === user?.user_id);
</script>

<div class="relative h-full">
	<div class="flex h-full flex-col bg-white dark:bg-gray-900 px-6">
		<div class="flex h-16 flex-shrink-0 items-center gap-x-3">
			<a href="/" onclick={handleItemClick}>
				<div class="h-6">
					<div
						class="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current text-gray-900 dark:text-white"
					>
						{@html logoSvg}
					</div>
				</div>
			</a>
			{#if selected_project}
				<div class="relative flex-1" bind:this={dropdownRef}>
					<div class="flex w-full items-center gap-x-1">
						<a
							href="/project/{selected_project._id}"
							class="flex-1 truncate text-base font-semibold text-gray-900 hover:text-gray-700 dark:text-gray-100 dark:hover:text-white"
							onclick={handleItemClick}
						>
							{selected_project.name}
						</a>
						<button
							onclick={() => (showProjectDropdown = !showProjectDropdown)}
							class="flex items-center text-gray-900 hover:text-gray-700 dark:text-gray-100 dark:hover:text-white"
						>
							{@html chevronDownIcon}
						</button>
					</div>

					{#if showProjectDropdown}
						<div
							class="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 shadow-lg"
						>
							{#each $projectsStore as project}
								<a
									href="/project/{project._id}"
									onclick={() => {
										showProjectDropdown = false;
										handleItemClick();
									}}
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white {project._id ===
									selected_project._id
										? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
										: ''}"
								>
									{project.name}
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{:else}
				<div class="relative flex-1">
					<button
						class="flex w-full items-center justify-between gap-x-1 text-base font-semibold text-gray-900 hover:text-gray-700 dark:text-gray-100 dark:hover:text-white"
					>
						Sourcery.info
					</button>
				</div>
			{/if}
		</div>
		<nav class="flex-grow-1 flex flex-1 flex-col">
			<ul role="list" class="flex flex-1 flex-col gap-y-7">
				<li>
					<ul role="list" class="-mx-2 space-y-1">
						{#if !selected_project}
							<li>
								<a
									href="/"
									onclick={handleItemClick}
									class="group flex gap-x-3 rounded-md bg-gray-100 dark:bg-gray-800 p-2 text-sm/6 font-semibold text-gray-900 dark:text-white"
								>
									{@html homeIcon}
									Projects
								</a>
							</li>
						{/if}
					</ul>
				</li>
				{#if selected_project}
					<li>
						<SidebarFiles {selected_project} {user} onclick={handleItemClick} />
					</li>
					{#if $filesStore.length > 0}
						<li>
							<SidebarConversations {selected_project} {user} onclick={handleItemClick} />
						</li>
						<li>
							<SidebarEntities {selected_project} {user} onclick={handleItemClick} />
						</li>
					{/if}
				{:else}
					{#each $projectsStore as project}
						<li>
							<a
								href={`/project/${project._id}`}
								class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
								onclick={handleItemClick}
							>
								{project.name}
							</a>
						</li>
					{/each}
				{/if}
			</ul>
		</nav>
		{#if is_owner}
			<div
				class="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pt-4 pb-4"
			>
				<a
					href={selected_project ? `/project/${selected_project._id}/settings` : '/settings'}
					onclick={handleItemClick}
					class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
				>
					{@html settingsIcon}
					Settings
				</a>
			</div>
		{/if}
	</div>
</div>
