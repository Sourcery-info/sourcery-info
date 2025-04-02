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
	import { alertsStore } from '$lib/stores/alerts.store';

	export let isAlertsMenuOpen = false;

	async function markAlertsSeen() {
		await fetch('/alert/seen', {
			method: 'POST'
		});
		alertsStore.update((alerts) => alerts.map((alert) => ({ ...alert, seen: true })));
	}

	async function toggleAlertsMenu() {
		const wasOpen = isAlertsMenuOpen;
		isAlertsMenuOpen = !isAlertsMenuOpen;
		if (wasOpen) {
			await markAlertsSeen();
		}
	}
</script>

<div class="relative">
	<button
		type="button"
		class="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
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
				class="absolute -right-1 -top-1 size-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"
			></div>
		{/if}
	</button>

	{#if isAlertsMenuOpen}
		<div
			class="absolute right-0 z-10 mt-2.5 w-80 origin-top-right rounded-md bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-gray-900/5 dark:ring-white/5 focus:outline-none"
			role="menu"
			aria-orientation="vertical"
			aria-labelledby="alerts-menu-button"
			tabindex="-1"
			transition:fly={{ y: -10, duration: 200 }}
		>
			<div class="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white">Alerts</div>
			<div class="divide-y divide-gray-100 dark:divide-gray-700">
				{#each $alertsStore.filter((alert) => !alert.seen) as alert (alert._id)}
					<div class="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">
						<div class="flex items-start gap-x-3">
							{#if alert.type === 'error'}
								<div class="flex-none rounded-full bg-red-50 dark:bg-red-900/50 p-1 mt-0.5">
									<div class="size-2 rounded-full bg-red-500"></div>
								</div>
							{:else if alert.type === 'warning'}
								<div class="flex-none rounded-full bg-yellow-50 dark:bg-yellow-900/50 p-1 mt-0.5">
									<div class="size-2 rounded-full bg-yellow-500"></div>
								</div>
							{:else}
								<div class="flex-none rounded-full bg-blue-50 dark:bg-blue-900/50 p-1 mt-0.5">
									<div class="size-2 rounded-full bg-blue-500"></div>
								</div>
							{/if}
							<p
								class="text-sm text-gray-600 dark:text-gray-300 break-words max-w-[250px] truncate"
							>
								{alert.message}
							</p>
						</div>
					</div>
				{:else}
					<div class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No unread alerts</div>
				{/each}
				<div class="px-3 py-2">
					<a
						href="/alerts"
						class="block text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
						on:click={() => {
							isAlertsMenuOpen = false;
							markAlertsSeen();
						}}
					>
						View all alerts
					</a>
				</div>
			</div>
		</div>
	{/if}
</div>
