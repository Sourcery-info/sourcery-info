<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { filesStore } from '$lib/stores/files';
	import { projectsStore } from '$lib/stores/projects';
	import { entitiesStore } from '$lib/stores/entities';
	import { conversationsStore } from '$lib/stores/conversations';
	import { alertsStore } from '$lib/stores/alertsStore';
	import { onMount, onDestroy } from 'svelte';
	import Sidebar from '$lib/ui/sidebar/sidebar.svelte';
	import { connect, subscribe, unsubscribe_all } from '@sourcery/ws/src/client.js';

	let ws_connected = false;

	export let data = {
		projects: [],
		project: null,
		session: null,
		conversations: [],
		user: null,
		alerts: [],
		origin: '',
		entities: [],
		token: null
	};

	async function connect_ws() {
		if (!ws_connected && data.token) {
			try {
				await connect(`${data.origin.replace('https://', 'wss://')}`, data.token);
				ws_connected = true;
			} catch (error) {
				console.error('Error connecting to websocket server', error);
				ws_connected = false;
			}
		}
		await subscribe(`${data.user.user_id}:alert`, (message) => {
			if (!message.alert?._id) return;
			alertsStore.upsert(message.alert);
		});
		await subscribe(`${data.user.user_id}:entity`, (message) => {
			if (!message.entity?._id) return;
			if (message.entity.project !== data.project?._id) return;
			entitiesStore.upsert(message.entity);
		});
		await subscribe(`${data.user.user_id}:file`, (message) => {
			if (!message.file?._id) return;
			if (message.file.project !== data.project?._id) return;
			filesStore.upsert(message.file);
		});
		await subscribe(`${data.user.user_id}:conversation`, (message) => {
			if (!message.conversation?._id) return;
			if (!message.conversation?.messages?.length) return;
			if (message.conversation.project !== data.project?._id) return;
			conversationsStore.upsert(message.conversation);
		});
	}

	$: {
		if (data.project?.files) {
			filesStore.set(data.project.files.filter((f) => f.project === data.project?._id));
		}
		if (data.projects) {
			projectsStore.set(data.projects);
		}
		if (data.conversations) {
			conversationsStore.set(data.conversations.filter((c) => c.project_id === data.project?._id));
		}
		if (data.entities) {
			entitiesStore.set(data.entities.filter((e) => e.project_id === data.project?._id));
		}
		if (data.alerts) {
			alertsStore.set(data.alerts);
		}
	}

	let isMobileMenuOpen = false;
	let isUserMenuOpen = false;
	let isAlertsMenuOpen = false;

	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	function toggleUserMenu() {
		isUserMenuOpen = !isUserMenuOpen;
	}

	async function toggleAlertsMenu() {
		const wasOpen = isAlertsMenuOpen;
		isAlertsMenuOpen = !isAlertsMenuOpen;
		if (wasOpen && data.user) {
			await markAlertsSeen();
		}
	}

	async function markAlertsSeen() {
		await fetch('/alert/seen', {
			method: 'POST'
		});
		alertsStore.update((alerts) => alerts.map((alert) => ({ ...alert, seen: true })));
	}

	// Close menus when clicking outside
	async function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (isUserMenuOpen && !target.closest('#user-menu-button')) {
			isUserMenuOpen = false;
		}
		if (isAlertsMenuOpen && !target.closest('#alerts-menu-button')) {
			isAlertsMenuOpen = false;
			await markAlertsSeen();
		}
	}

	function handleSidebarClick() {
		isMobileMenuOpen = false;
	}

	let searchQuery = '';
	let showSearchResults = false;

	interface SearchEntity {
		id: string;
		name: string;
		type: string;
		description: string;
	}

	interface SearchFile {
		id: string;
		name: string;
		type: string;
		metadata: string;
	}

	interface SearchConversation {
		id: string;
		name: string;
		preview: string;
	}

	interface SearchResults {
		entities: SearchEntity[];
		files: SearchFile[];
		conversations: SearchConversation[];
	}

	// Search results state
	let searchResults: SearchResults = {
		entities: [],
		files: [],
		conversations: []
	};

	async function performSearch() {
		if (!searchQuery.trim()) {
			searchResults = { entities: [], files: [], conversations: [] };
			return;
		}

		try {
			const response = await fetch('/search', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					query: searchQuery,
					project_id: data.project?._id
				})
			});

			if (!response.ok) {
				throw new Error('Search failed');
			}

			const results = await response.json();
			searchResults = results;
		} catch (error) {
			console.error('Search error:', error);
			searchResults = { entities: [], files: [], conversations: [] };
		}
	}

	// Debounce the search to avoid too many requests
	let searchTimeout: NodeJS.Timeout;
	function handleSearch(event: Event) {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;
		showSearchResults = searchQuery.length > 0;

		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(performSearch, 300);
	}

	function handleSearchFocusOut(event: FocusEvent) {
		// Keep dropdown open if clicking inside it
		const target = event.relatedTarget as HTMLElement;
		if (!target?.closest('.search-results')) {
			showSearchResults = false;
		}
	}

	function handleSearchFocusIn() {
		showSearchResults = searchQuery.length > 0;
	}

	function handleSubmit(event: Event) {
		event.preventDefault();
		if (searchQuery.trim()) {
			clearTimeout(searchTimeout);
			performSearch();
		}
	}

	onMount(() => {
		return (async () => {
			await connect_ws();
		})();
	});

	// onDestroy(() => {
	// 	unsubscribe_all();
	// });
</script>

<svelte:window on:click={handleClickOutside} />

<div class="min-h-screen bg-gray-900">
	<!-- Mobile menu -->
	{#if isMobileMenuOpen}
		<div
			class="relative z-50 lg:hidden"
			role="dialog"
			aria-modal="true"
			transition:fade={{ duration: 300 }}
		>
			<div class="fixed inset-0 bg-gray-900/80" aria-hidden="true"></div>
			<div class="fixed inset-0 flex">
				<div
					class="relative mr-16 flex w-full max-w-xs flex-1"
					transition:fly={{ x: -100, duration: 300 }}
				>
					<div class="flex h-full w-full flex-col overflow-y-auto">
						<Sidebar selected_project={data.project} on:menuItemClick={handleSidebarClick} />
					</div>
					<div class="absolute left-full top-0 flex w-16 justify-center pt-5">
						<button type="button" class="-m-2.5 p-2.5" on:click={toggleMobileMenu}>
							<span class="sr-only">Close sidebar</span>
							<svg
								class="size-6 text-white"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								aria-hidden="true"
								data-slot="icon"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Desktop sidebar -->
	<div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
		<div class="flex h-full flex-col overflow-y-auto">
			<Sidebar selected_project={data.project} on:menuItemClick={() => {}} />
		</div>
	</div>

	<!-- Main content -->
	<div class="lg:pl-72">
		<div
			class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8"
		>
			<!-- Mobile menu button -->
			<button
				type="button"
				class="-m-2.5 p-2.5 text-gray-700 lg:hidden"
				on:click={toggleMobileMenu}
			>
				<span class="sr-only">Open sidebar</span>
				<svg
					class="size-6"
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
						d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
					/>
				</svg>
			</button>

			<!-- Separator -->
			<div class="h-6 w-px bg-gray-900/10 lg:hidden" aria-hidden="true"></div>

			<div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
				<form
					class="grid flex-1 grid-cols-1 relative"
					action="#"
					method="GET"
					on:submit={handleSubmit}
				>
					<input
						type="search"
						name="search"
						aria-label="Search"
						autocomplete="off"
						class="col-start-1 row-start-1 block size-full bg-white pl-8 text-base text-gray-900 outline-none placeholder:text-gray-400 sm:text-sm/6"
						placeholder="Search"
						value={searchQuery}
						on:input={handleSearch}
						on:focusin={handleSearchFocusIn}
						on:focusout={handleSearchFocusOut}
					/>
					<svg
						class="pointer-events-none col-start-1 row-start-1 size-5 self-center text-gray-400"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
						data-slot="icon"
					>
						<path
							fill-rule="evenodd"
							d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
							clip-rule="evenodd"
						/>
					</svg>

					{#if showSearchResults}
						<div
							class="search-results absolute top-full left-0 right-0 mt-2 bg-white rounded-md shadow-lg ring-1 ring-gray-900/5 max-h-96 overflow-y-auto z-50"
							on:click={() => (showSearchResults = false)}
						>
							<!-- Entities -->
							{#if searchResults.entities.length > 0}
								<div class="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">Entities</div>
								{#each searchResults.entities as entity (entity.id)}
									<a
										href="/entity/{data.project?._id}/{entity.id}"
										class="block px-4 py-2 hover:bg-gray-50"
									>
										<div class="text-sm font-medium text-gray-900">{entity.name}</div>
										<div class="text-xs text-gray-500">{entity.type} • {entity.description}</div>
									</a>
								{/each}
							{/if}

							<!-- Files -->
							{#if searchResults.files.length > 0}
								<div class="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">Files</div>
								{#each searchResults.files as file (file.id)}
									<a
										href="/file/{data.project?._id}/{file.id}"
										class="block px-4 py-2 hover:bg-gray-50"
									>
										<div class="text-sm font-medium text-gray-900">{file.name}</div>
										<div class="text-xs text-gray-500">{file.type} • {file.metadata}</div>
									</a>
								{/each}
							{/if}

							<!-- Conversations -->
							{#if searchResults.conversations.length > 0}
								<div class="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
									Conversations
								</div>
								{#each searchResults.conversations as conversation (conversation.id)}
									<a
										href="/chat/{data.project?._id}/{conversation.id}"
										class="block px-4 py-2 hover:bg-gray-50"
									>
										<div class="text-sm font-medium text-gray-900">{conversation.name}</div>
										<div class="text-xs text-gray-500">{conversation.preview}</div>
									</a>
								{/each}
							{/if}

							<!-- No results message -->
							{#if searchResults.entities.length === 0 && searchResults.files.length === 0 && searchResults.conversations.length === 0}
								<div class="px-4 py-2 text-sm text-gray-500">No results found</div>
							{/if}
						</div>
					{/if}
				</form>

				<div class="flex items-center gap-x-4 lg:gap-x-6">
					<div class="relative">
						<button
							type="button"
							class="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
							id="alerts-menu-button"
							on:click={toggleAlertsMenu}
						>
							<span class="sr-only">View notifications</span>
							<svg
								class="size-6"
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
									d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
								/>
							</svg>
							{#if $alertsStore.some((alert) => !alert.seen)}
								<div
									class="absolute -right-1 -top-1 size-2.5 rounded-full bg-red-500 ring-2 ring-white"
								></div>
							{/if}
						</button>

						{#if isAlertsMenuOpen}
							<div
								class="absolute right-0 z-10 mt-2.5 w-80 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none"
								role="menu"
								aria-orientation="vertical"
								aria-labelledby="alerts-menu-button"
								tabindex="-1"
								transition:fly={{ y: -10, duration: 200 }}
							>
								<div class="px-3 py-2 text-sm font-semibold text-gray-900">Alerts</div>
								<div class="divide-y divide-gray-100">
									{#each $alertsStore.filter((alert) => !alert.seen) as alert (alert._id)}
										<div class="px-3 py-2 hover:bg-gray-50">
											<div class="flex items-center gap-x-3">
												{#if alert.type === 'error'}
													<div class="flex-none rounded-full bg-red-50 p-1">
														<div class="size-2 rounded-full bg-red-500"></div>
													</div>
												{:else if alert.type === 'warning'}
													<div class="flex-none rounded-full bg-yellow-50 p-1">
														<div class="size-2 rounded-full bg-yellow-500"></div>
													</div>
												{:else}
													<div class="flex-none rounded-full bg-blue-50 p-1">
														<div class="size-2 rounded-full bg-blue-500"></div>
													</div>
												{/if}
												<p class="text-sm text-gray-600">{alert.message}</p>
											</div>
										</div>
									{:else}
										<div class="px-3 py-2 text-sm text-gray-500">No unread alerts</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>

					<!-- Separator -->
					<div class="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10" aria-hidden="true"></div>

					<!-- Profile dropdown -->
					<div class="relative">
						<button
							type="button"
							class="-m-1.5 flex items-center p-1.5"
							id="user-menu-button"
							on:click={toggleUserMenu}
						>
							<span class="sr-only">Open user menu</span>
							<span class="hidden lg:flex lg:items-center">
								<span class="ml-4 text-sm/6 font-semibold text-gray-900" aria-hidden="true"
									>{data.user?.name}</span
								>
								<svg
									class="ml-2 size-5 text-gray-400"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
									data-slot="icon"
								>
									<path
										fill-rule="evenodd"
										d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
										clip-rule="evenodd"
									/>
								</svg>
							</span>
						</button>

						{#if isUserMenuOpen}
							<div
								class="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none"
								role="menu"
								aria-orientation="vertical"
								aria-labelledby="user-menu-button"
								tabindex="-1"
								transition:fly={{ y: -10, duration: 200 }}
							>
								<a
									href="/profile"
									class="block px-3 py-1 text-sm/6 text-gray-900"
									role="menuitem"
									tabindex="-1">Your profile</a
								>
								<a
									href="/logout"
									class="block px-3 py-1 text-sm/6 text-gray-900"
									role="menuitem"
									tabindex="-1">Sign out</a
								>
								<a
									href="/settings"
									class="block px-3 py-1 text-sm/6 text-gray-900"
									role="menuitem"
									tabindex="-1">Settings</a
								>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<main class="py-10">
			<div class="px-4 sm:px-6 lg:px-8">
				<slot />
			</div>
		</main>
	</div>
</div>
