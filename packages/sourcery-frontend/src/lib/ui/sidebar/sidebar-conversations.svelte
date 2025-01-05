<script lang="ts">
	import { page } from '$app/state';
	import { conversationsStore } from '$lib/stores/conversations';

	let { selected_project, onclick } = $props();

	const MAX_CONVERSATIONS = 8;
	let visibleConversations = $derived($conversationsStore.slice(0, MAX_CONVERSATIONS));
	let hasMoreConversations = $derived($conversationsStore.length > MAX_CONVERSATIONS);
</script>

<div>
	<div class="text-xs/6 font-semibold text-gray-400">
		<a href="/conversations/{selected_project._id}" {onclick}>Conversations</a>
	</div>
	<ul role="list" class="mt-2 space-y-0">
		<li>
			<a
				href="/chat/{selected_project._id}"
				{onclick}
				class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-gray-800 hover:text-white"
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
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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
						class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-regular text-gray-400 hover:bg-gray-800 hover:text-white {conversation._id ===
						page.params.conversation_id
							? 'bg-gray-800 text-white'
							: 'text-gray-400 hover:bg-gray-800 hover:text-white'}"
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
