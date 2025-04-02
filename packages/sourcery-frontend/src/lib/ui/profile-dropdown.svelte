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
	import { fly } from 'svelte/transition';

	export let user: { name: string; admin: boolean } | null = null;
	export let isUserMenuOpen = false;

	function toggleUserMenu() {
		isUserMenuOpen = !isUserMenuOpen;
	}
</script>

<div class="relative">
	<button
		type="button"
		class="-m-1.5 flex items-center p-1.5"
		id="user-menu-button"
		on:click={toggleUserMenu}
	>
		<span class="sr-only">Open user menu</span>
		<span class="hidden lg:flex lg:items-center">
			<span class="ml-4 text-sm/6 font-semibold text-gray-900 dark:text-white" aria-hidden="true"
				>{user?.name}</span
			>
			<svg
				class="ml-2 size-5 text-gray-400 dark:text-gray-500"
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
			class="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-gray-900/5 dark:ring-white/5 focus:outline-none"
			role="menu"
			aria-orientation="vertical"
			aria-labelledby="user-menu-button"
			tabindex="-1"
			transition:fly={{ y: -10, duration: 200 }}
		>
			<a
				href="/profile"
				class="block px-3 py-1 text-sm/6 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
				role="menuitem"
				tabindex="-1">Your profile</a
			>
			<a
				href="/logout"
				class="block px-3 py-1 text-sm/6 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
				role="menuitem"
				tabindex="-1">Sign out</a
			>
			<a
				href="/settings"
				class="block px-3 py-1 text-sm/6 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
				role="menuitem"
				tabindex="-1">Settings</a
			>
			{#if user?.admin}
				<a
					href="/admin"
					class="block px-3 py-1 text-sm/6 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
					role="menuitem"
					tabindex="-1">Admin</a
				>
			{/if}
		</div>
	{/if}
</div>
