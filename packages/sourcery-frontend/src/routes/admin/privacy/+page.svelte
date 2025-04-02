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
	import type { PrivacyPolicy } from '@sourcery/common/types/PrivacyPolicy.type';
	import SuccessAlert from '$lib/ui/success-alert.svelte';
	import { page } from '$app/state';

	export let data: { policies: PrivacyPolicy[] };
	let showSuccess = false;

	$: showSuccess = page.url.searchParams.get('alert') === 'privacy-updated';
</script>

<div class="min-h-full">
	<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center">
			<h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
				Privacy Policy
			</h1>
			<a
				href="/admin/privacy/new"
				class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			>
				Create New Version
			</a>
		</div>
	</div>

	<main>
		<div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
			<div class="px-4 py-6 sm:px-0">
				<div
					class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 sm:rounded-lg"
				>
					<table class="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
						<thead class="bg-gray-50 dark:bg-gray-700">
							<tr>
								<th
									scope="col"
									class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-6"
									>Version</th
								>
								<th
									scope="col"
									class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
									>Status</th
								>
								<th
									scope="col"
									class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
									>Created</th
								>
								<th
									scope="col"
									class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
									>Last Updated</th
								>
								<th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
									<span class="sr-only">Actions</span>
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
							{#each data.policies as policy}
								<tr>
									<td
										class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-200 sm:pl-6"
									>
										{policy.version}
									</td>
									<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
										{#if policy.active}
											<span
												class="inline-flex items-center rounded-md bg-green-50 dark:bg-green-900 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-200 ring-1 ring-inset ring-green-600/20"
											>
												Active
											</span>
										{:else}
											<span
												class="inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10"
											>
												Inactive
											</span>
										{/if}
									</td>
									<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
										{new Date(policy.created_at).toLocaleDateString()}
									</td>
									<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
										{new Date(policy.updated_at).toLocaleDateString()}
									</td>
									<td
										class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
									>
										<a
											href="/admin/privacy/{policy._id}"
											class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
										>
											Edit
										</a>
									</td>
								</tr>
							{:else}
								<tr>
									<td
										colspan="5"
										class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center"
									>
										No privacy policies found
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</main>
</div>

<SuccessAlert bind:show={showSuccess} message="Privacy Policy updated successfully" />
