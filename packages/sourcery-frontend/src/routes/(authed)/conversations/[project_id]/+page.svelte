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
	import { conversationsStore } from '$lib/stores/conversations.store';
	import { page } from '$app/state';

	$: is_owner = page.data.project.owner === page.data.user?.user_id;
	$: conversations = $conversationsStore
		.filter((conversation) => conversation.project_id === page.data.project._id)
		.filter((conversation) => conversation.user_id === page.data.user?.user_id);
</script>

<div class="min-h bg-white dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
	<div class="max-w-7xl mx-auto">
		<h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">All Conversations</h1>

		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each conversations as conversation}
				<a
					href="/chat/{conversation.project_id}/{conversation._id}"
					class="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg ring-1 ring-gray-200 dark:ring-white/10 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				>
					<div class="flex items-center justify-between">
						<h2 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
							{conversation.description}
						</h2>
						<span class="text-gray-500 dark:text-gray-400">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</span>
					</div>
					<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
						{conversation.created_at ? new Date(conversation.created_at).toLocaleDateString() : ''}
					</p>
				</a>
			{/each}
		</div>
	</div>
</div>
