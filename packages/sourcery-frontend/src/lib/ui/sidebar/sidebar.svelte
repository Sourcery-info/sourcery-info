<script lang="ts">
	// @ts-nocheck
	/** @type {import('./$types').PageData} */
	import { projectsStore } from '$lib/stores/projects';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	import logo from '$lib/assets/Sourcery Logo.png';
	import chevronDownIcon from '$lib/assets/icons/chevron-down.svg?raw';
	import homeIcon from '$lib/assets/icons/home.svg?raw';
	import settingsIcon from '$lib/assets/icons/settings.svg?raw';
	import SidebarFiles from './sidebar-files.svelte';
	import SidebarEntities from './sidebar-entities.svelte';
	import SidebarConversations from './sidebar-conversations.svelte';

	let { selected_project } = $props();

	let showProjectDropdown = $state(false);
	let dropdownRef = $state(null);

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
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="relative h-full">
	<div class="flex h-full flex-col bg-gray-900 px-6">
		<div class="flex h-16 flex-shrink-0 items-center gap-x-3">
			<a href="/" onclick={handleItemClick}
				><img class="h-8 w-auto" src={logo} alt="Sourcery.info Logo" /></a
			>
			{#if selected_project}
				<div class="relative flex-1" bind:this={dropdownRef}>
					<button
						onclick={() => (showProjectDropdown = !showProjectDropdown)}
						class="flex w-full items-center justify-between gap-x-1 text-base font-semibold text-gray-100 hover:text-white"
					>
						<span class="truncate">{selected_project.name}</span>
						{@html chevronDownIcon}
					</button>

					{#if showProjectDropdown}
						<div
							class="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-gray-700 bg-gray-800 py-1 shadow-lg"
						>
							{#each $projectsStore as project}
								<a
									href="/project/{project._id}"
									onclick={() => {
										showProjectDropdown = false;
										handleItemClick();
									}}
									class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white {project._id ===
									selected_project._id
										? 'bg-gray-700 text-white'
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
						class="flex w-full items-center justify-between gap-x-1 text-base font-semibold text-gray-100 hover:text-white"
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
									class="group flex gap-x-3 rounded-md bg-gray-800 p-2 text-sm/6 font-semibold text-white"
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
						<SidebarFiles {selected_project} onclick={handleItemClick} />
					</li>
					<li>
						<SidebarEntities {selected_project} onclick={handleItemClick} />
					</li>
					<li>
						<SidebarConversations {selected_project} onclick={handleItemClick} />
					</li>
				{/if}
			</ul>
		</nav>
		<div class="flex-shrink-0 border-t border-gray-700 bg-gray-900 pt-4 pb-4">
			<a
				href={selected_project ? `/project/${selected_project._id}/settings` : '/settings'}
				onclick={handleItemClick}
				class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-gray-800 hover:text-white"
			>
				{@html settingsIcon}
				Settings
			</a>
		</div>
	</div>
</div>
