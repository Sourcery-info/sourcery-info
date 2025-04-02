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
	import { page } from '$app/state';
	import { conversationsStore } from '$lib/stores/conversations.store';
	import plusIcon from '$lib/assets/icons/plus.svg?raw';
	import chatIcon from '$lib/assets/icons/chat.svg?raw';

	let { selected_project, onclick, user } = $props();

	const MAX_CONVERSATIONS = 8;
	let visibleConversations = $derived(
		$conversationsStore
			.slice(0, MAX_CONVERSATIONS)
			.filter((conversation) => conversation.project_id === selected_project._id)
			.filter((conversation) => conversation.user_id === user?.user_id)
	);
	let hasMoreConversations = $derived($conversationsStore.length > MAX_CONVERSATIONS);
</script>

<div>
	<div class="text-xs/6 font-semibold text-gray-600 dark:text-gray-400">
		<a href="/conversations/{selected_project._id}" {onclick}>Conversations</a>
	</div>
	<ul role="list" class="mt-2 space-y-0">
		<li>
			<a
				href="/chat/{selected_project._id}"
				{onclick}
				class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
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
					{@html plusIcon}
				</svg>
				New Conversation
			</a>
		</li>
		{#if $conversationsStore.length > 0}
			{#each visibleConversations as conversation}
				<li>
					<a
						href="/chat/{conversation.project_id}/{conversation._id}"
						{onclick}
						class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-regular text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white {conversation._id ===
						page.params.conversation_id
							? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
							: ''}"
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
						{onclick}
						class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
					>
						<span
							class="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-[0.625rem] font-medium text-gray-600 group-hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:text-white"
							>+</span
						>
						<span class="truncate">Show more...</span>
					</a>
				</li>
			{/if}
		{/if}
	</ul>
</div>
