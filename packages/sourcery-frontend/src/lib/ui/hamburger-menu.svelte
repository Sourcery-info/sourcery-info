<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	export let menuItems: Array<{
		label: string;
		icon?: string;
		onClick: () => void;
		disabled?: boolean;
		class?: string;
	}> = [];

	let isDropdownOpen = false;

	function toggleDropdown(event: Event) {
		event.stopPropagation();
		isDropdownOpen = !isDropdownOpen;
	}

	function handleClickOutside(event: MouseEvent) {
		const dropdown = document.getElementById('dropdown-menu');
		const button = document.getElementById('dropdown-button');
		if (
			isDropdownOpen &&
			dropdown &&
			button &&
			!dropdown.contains(event.target as Node) &&
			!button.contains(event.target as Node)
		) {
			isDropdownOpen = false;
		}
	}

	onMount(() => {
		if (browser) {
			window.addEventListener('click', handleClickOutside);
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<div class="relative">
	<button
		id="dropdown-button"
		aria-label="Menu actions"
		on:click={toggleDropdown}
		class="inline-flex items-center gap-x-1.5 rounded-md bg-white dark:bg-gray-800 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
	>
		<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
			<path
				d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 14a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"
			/>
		</svg>
	</button>

	{#if isDropdownOpen}
		<div
			id="dropdown-menu"
			class="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-10"
		>
			<div class="py-1">
				{#each menuItems as item}
					<button
						on:click={() => {
							item.onClick();
							isDropdownOpen = false;
						}}
						class="flex w-full items-center px-4 py-2 text-sm {item.class ||
							'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
						disabled={item.disabled}
					>
						{#if item.icon}
							{@html item.icon}
						{/if}
						{item.label}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
