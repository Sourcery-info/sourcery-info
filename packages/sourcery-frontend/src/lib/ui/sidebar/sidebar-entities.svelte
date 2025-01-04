<script lang="ts">
	import { page } from '$app/state';
	import { entitiesStore } from '$lib/stores/entities';

	let { selected_project, onclick } = $props();

	const MAX_ENTITIES = 8;
	let visibleEntities = $derived($entitiesStore.slice(0, MAX_ENTITIES));
	let hasMoreEntities = $derived($entitiesStore.length > MAX_ENTITIES);
</script>

<div>
	<div class="text-xs/6 font-semibold text-gray-400">
		<a href="/entity/{selected_project._id}" {onclick}>Entities</a>
	</div>
	<ul role="list" class="-mx-2 mt-2 space-y-0 max-h-[40vh] overflow-y-auto">
		{#if $entitiesStore.length > 0}
			{#each visibleEntities as entity}
				<li>
					<a
						href={`/entity/${selected_project._id}/${entity._id}`}
						{onclick}
						class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-regular text-gray-400 hover:bg-gray-800 hover:text-white {entity._id ===
						page.params.entity_id
							? 'bg-gray-800 text-white'
							: ''}"
					>
						{#if entity.type === 'PERSON'}
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
									d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
								/>
							</svg>
						{:else if entity.type === 'ORGANIZATION'}
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
									d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
								/>
							</svg>
						{:else if entity.type === 'LOCATION'}
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
									d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
								/>
							</svg>
						{:else if entity.type === 'DATE'}
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
									d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
								/>
							</svg>
						{:else}
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
									d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
								/>
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
							</svg>
						{/if}
						<span class="truncate">{entity.value}</span>
					</a>
				</li>
			{/each}
			{#if hasMoreEntities}
				<li>
					<a
						href="/entities/{selected_project._id}"
						{onclick}
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
</div>
