<script lang="ts">
	// @ts-nocheck
	/** @type {import('./$types').PageData} */
	import { projectsStore } from '$lib/stores/projects';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	import logo from '$lib/assets/Sourcery Logo.png';
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
						<svg
							class="size-4 shrink-0 transition-transform {showProjectDropdown ? 'rotate-180' : ''}"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="2"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M19.5 8.25l-7.5 7.5-7.5-7.5"
							/>
						</svg>
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
									<svg
										class="size-6 shrink-0"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										aria-hidden="true"
										data-slot="icon"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
										/>
									</svg>
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
				<svg
					class="size-6 shrink-0"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					aria-hidden="true"
					data-slot="icon"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
					/>
				</svg>
				Settings
			</a>
		</div>
	</div>
</div>
