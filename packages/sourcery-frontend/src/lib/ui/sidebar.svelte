<script lang="ts">
	// @ts-nocheck
	/** @type {import('./$types').PageData} */
	import { page } from '$app/stores';
	import { filesStore } from '$lib/stores/files';
	export let selected_project;
	export let conversations = [];
	import { enhance } from '$app/forms';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	import logo from '$lib/assets/Sourcery Logo.png';

	const MAX_CONVERSATIONS = 8;

	$: visibleConversations = conversations.slice(0, MAX_CONVERSATIONS);
	$: hasMoreConversations = conversations.length > MAX_CONVERSATIONS;

	// async function toggleActive(file) {
	// 	file.status = file.status == 'active' ? 'inactive' : 'active';
	// 	selected_project = selected_project;
	// 	const res = await fetch(`/files/${selected_project._id}?/update`, {
	// 		method: 'POST',
	// 		body: JSON.stringify(file)
	// 	});
	// }

	function handleItemClick() {
		dispatch('menuItemClick');
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
			filesStore.update((files) => [...files, ...res_json.files]);
		}

		event.target.value = '';
	}

	import { onMount } from 'svelte';

	import { projectsStore } from '$lib/stores/projects';

	let showProjectDropdown = false;
	let dropdownRef;

	function handleClickOutside(event) {
		if (dropdownRef && !dropdownRef.contains(event.target)) {
			showProjectDropdown = false;
		}
	}

	onMount(() => {
		projectsStore.init();
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="relative h-full">
	<div class="flex h-full flex-col bg-gray-900 px-6 pb-20">
		<div class="flex h-16 shrink-0 items-center gap-x-3">
			<a href="/" on:click={handleItemClick}
				><img class="h-8 w-auto" src={logo} alt="Sourcery.info Logo" /></a
			>
			{#if selected_project}
				<div class="relative flex-1" bind:this={dropdownRef}>
					<button
						on:click={() => (showProjectDropdown = !showProjectDropdown)}
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
									on:click={() => {
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
			{/if}
		</div>
		<nav class="flex flex-1 flex-col">
			<ul role="list" class="flex flex-1 flex-col gap-y-7">
				<li>
					<ul role="list" class="-mx-2 space-y-1">
						{#if !selected_project}
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
				{#if selected_project}
					<li>
						<div class="text-xs/6 font-semibold text-gray-400">
							<a href="/files/{selected_project._id}">Files</a>
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
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M12 4.5v15m7.5-7.5h-15"
										/>
									</svg>
									<span>Upload Files</span>
									<input
										type="file"
										multiple
										class="hidden"
										on:change={handleFileUpload}
										accept=".txt,.pdf,.doc,.docx"
									/>
								</label>
							</li>
							{#if $filesStore.length > 0}
								{#each $filesStore as file}
									<li>
										<a
											href={`/file/${selected_project._id}/${file._id}`}
											class="group flex w-full items-center gap-x-3 rounded-md p-2 text-sm/6 font-regular
												{file._id === $page.params.file_id
												? 'bg-gray-800 text-white'
												: 'text-gray-400 hover:bg-gray-800 hover:text-white'}"
										>
											{#if file.stage !== 'done'}
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
											{:else}
												<svg
													class="size-5 shrink-0 {file.status === 'active'
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
									</li>
								{/each}
							{/if}
						</ul>
					</li>
				{/if}
				{#if selected_project}
					<li>
						<div class="text-xs/6 font-semibold text-gray-400">
							<a href="/conversations/{selected_project._id}">Conversations</a>
						</div>
						<ul role="list" class="-mx-2 mt-2 space-y-1 max-h-[40vh] overflow-y-auto">
							<li>
								<a
									href="/chat/{selected_project._id}"
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
							{#if conversations.length > 0}
								{#each visibleConversations as conversation}
									<li>
										<a
											href="/chat/{conversation.project_id}/{conversation._id}"
											on:click={handleItemClick}
											class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-regular text-gray-400 hover:bg-gray-800 hover:text-white {conversation._id ===
											$page.params.conversation_id
												? 'bg-gray-800 text-white'
												: 'text-gray-400 hover:bg-gray-800 hover:text-white'}"
										>
											<svg
												class="size-5 shrink-0"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
												/>
											</svg>
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
							{/if}
						</ul>
					</li>
				{/if}
			</ul>
		</nav>
	</div>

	<div class="absolute bottom-0 left-0 right-0 bg-gray-900 px-6 pb-4">
		<a
			href={selected_project ? `/project/${selected_project._id}/settings` : '/settings'}
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
	</div>
</div>

<style>
</style>
