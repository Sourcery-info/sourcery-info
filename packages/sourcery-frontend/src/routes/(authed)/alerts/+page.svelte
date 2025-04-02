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
	import type { TAlert } from '@sourcery/common/types/Alert.type';

	export let data: { alerts: TAlert[] };
	const alerts = data.alerts;
</script>

<div class="min-h-full bg-white dark:bg-gray-900">
	<main>
		<div class="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
			<h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
				Alert History
			</h1>
			<div class="space-y-4">
				{#each alerts as alert (alert._id)}
					<div class="bg-white dark:bg-gray-800 shadow rounded-lg p-4 transition-colors">
						<div class="flex items-start gap-x-3">
							{#if alert.type === 'error'}
								<div class="flex-none rounded-full bg-red-50 dark:bg-red-900/20 p-1 mt-0.5">
									<div class="size-2 rounded-full bg-red-500"></div>
								</div>
							{:else if alert.type === 'warning'}
								<div class="flex-none rounded-full bg-yellow-50 dark:bg-yellow-900/20 p-1 mt-0.5">
									<div class="size-2 rounded-full bg-yellow-500"></div>
								</div>
							{:else}
								<div class="flex-none rounded-full bg-blue-50 dark:bg-blue-900/20 p-1 mt-0.5">
									<div class="size-2 rounded-full bg-blue-500"></div>
								</div>
							{/if}
							<div class="flex-1 min-w-0">
								<p class="text-sm text-gray-600 dark:text-gray-300 break-words whitespace-pre-wrap">
									{alert.message}
								</p>
								<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
									{alert.created_at}
								</p>
							</div>
							{#if !alert.seen}
								<div class="flex-none">
									<span
										class="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/20 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/30"
										>New</span
									>
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<div class="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
						<p class="text-sm text-gray-500 dark:text-gray-400">No alerts found</p>
					</div>
				{/each}
			</div>
		</div>
	</main>
</div>
