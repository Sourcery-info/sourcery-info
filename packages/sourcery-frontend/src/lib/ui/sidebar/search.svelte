<script lang="ts">
	import { fly } from 'svelte/transition';

	export let project_id: string | null = null;

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
					project_id
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
</script>

<form class="grid flex-1 grid-cols-1 relative" action="#" method="GET" on:submit={handleSubmit}>
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
		<button
			class="search-results absolute top-full left-0 right-0 mt-2 bg-white rounded-md shadow-lg ring-1 ring-gray-900/5 max-h-96 overflow-y-auto z-50"
			tabindex="-1"
			on:click={() => (showSearchResults = false)}
			on:keydown={(e) => e.key === 'Escape' && (showSearchResults = false)}
			aria-label="Search results"
		>
			<!-- Entities -->
			{#if searchResults.entities.length > 0}
				<div class="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">Entities</div>
				{#each searchResults.entities as entity (entity.id)}
					<a href="/entity/{project_id}/{entity.id}" class="block px-4 py-2 hover:bg-gray-50">
						<div class="text-sm font-medium text-gray-900">{entity.name}</div>
						<div class="text-xs text-gray-500">{entity.type} • {entity.description}</div>
					</a>
				{/each}
			{/if}

			<!-- Files -->
			{#if searchResults.files.length > 0}
				<div class="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">Files</div>
				{#each searchResults.files as file (file.id)}
					<a href="/file/{project_id}/{file.id}" class="block px-4 py-2 hover:bg-gray-50">
						<div class="text-sm font-medium text-gray-900">{file.name}</div>
						<div class="text-xs text-gray-500">{file.type} • {file.metadata}</div>
					</a>
				{/each}
			{/if}

			<!-- Conversations -->
			{#if searchResults.conversations.length > 0}
				<div class="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">Conversations</div>
				{#each searchResults.conversations as conversation (conversation.id)}
					<a href="/chat/{project_id}/{conversation.id}" class="block px-4 py-2 hover:bg-gray-50">
						<div class="text-sm font-medium text-gray-900">{conversation.name}</div>
						<div class="text-xs text-gray-500">{conversation.preview}</div>
					</a>
				{/each}
			{/if}

			<!-- No results message -->
			{#if searchResults.entities.length === 0 && searchResults.files.length === 0 && searchResults.conversations.length === 0}
				<div class="px-4 py-2 text-sm text-gray-500">No results found</div>
			{/if}
		</button>
	{/if}
</form>
