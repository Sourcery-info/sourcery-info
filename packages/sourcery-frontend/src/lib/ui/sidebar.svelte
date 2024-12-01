<script lang="ts">
	// @ts-nocheck
	/** @type {import('./$types').PageData} */
	export let selected_project;
	export let conversations = [];
	import { enhance } from '$app/forms';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	import logo from '$lib/assets/Sourcery Logo.png';

	const MAX_CONVERSATIONS = 8;

	$: visibleConversations = conversations.slice(0, MAX_CONVERSATIONS);
	$: hasMoreConversations = conversations.length > MAX_CONVERSATIONS;

	async function toggleActive(file) {
		file.status = file.status == 'active' ? 'inactive' : 'active';
		selected_project = selected_project;
		const res = await fetch(`/files/${selected_project.urlid}?/update`, {
			method: 'POST',
			body: JSON.stringify(file)
		});
	}

	function handleItemClick() {
		dispatch('menuItemClick');
	}
</script>

<div>
	<div class="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
		<div class="flex h-16 shrink-0 items-center">
			<a href="/" on:click={handleItemClick}
				><img class="h-8 w-auto" src={logo} alt="Sourcery.info Logo" /></a
			>
		</div>
		{#if selected_project}
			<div class="text-sm font-medium text-gray-200">
				{selected_project.name}
			</div>
		{/if}
		<nav class="flex flex-1 flex-col">
			<ul role="list" class="flex flex-1 flex-col gap-y-7">
				<li>
					<ul role="list" class="-mx-2 space-y-1">
						{#if selected_project}
							<li>
								<a
									href="/chat/new/{selected_project._id}"
									on:click={handleItemClick}
									class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-gray-800 hover:text-white"
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
											d="M12 4.5v15m7.5-7.5h-15"
										/>
									</svg>
									New Conversation
								</a>
							</li>
						{:else}
							<li>
								<a
									href="/"
									on:click={handleItemClick}
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
				{#if conversations.length > 0}
					<li>
						<div class="text-xs/6 font-semibold text-gray-400">Conversations</div>
						<ul role="list" class="-mx-2 mt-2 space-y-1">
							{#each visibleConversations as conversation}
								<li>
									<a
										href="/chat/{conversation.project_id}/{conversation._id}"
										on:click={handleItemClick}
										class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-regular text-gray-400 hover:bg-gray-800 hover:text-white"
									>
										<span class="truncate">{conversation.description}</span>
									</a>
								</li>
							{/each}
							{#if hasMoreConversations}
								<li>
									<a
										href="/conversations/{selected_project._id}"
										on:click={handleItemClick}
										class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-gray-800 hover:text-white"
									>
										<span
											class="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white"
											>+</span
										>
										<span class="truncate">Show more...</span>
									</a>
								</li>
							{/if}
						</ul>
					</li>
				{/if}
				<li class="mt-auto">
					<a
						href="/settings"
						on:click={handleItemClick}
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
				</li>
			</ul>
		</nav>
	</div>
</div>

<style>
</style>
