<script lang="ts">
	import type { Conversation as ConversationType } from '@sourcery/common/types/Conversation.type.js';
	import type { Project as ProjectType } from '@sourcery/common/types/Project.type.js';
	import ChatMessage from '$lib/ui/chat-message.svelte';
	import { conversationStore } from '$lib/stores/conversationStore';
	import { conversationsStore } from '$lib/stores/conversations';

	export let data: {
		conversation: ConversationType;
		project: ProjectType;
	};

	$: conversationStore.set(data.conversation);

	let input = '';
	let thinking = false;
	let lastQuery = '';

	async function handleSampleQuestion(question: string) {
		input = question;
		const event = new SubmitEvent('submit');
		await handleSubmit(event);
	}

	async function handleSubmit(event: SubmitEvent) {
		if (input === '') return;
		event.preventDefault();
		const query = input;
		lastQuery = query;
		input = '';
		thinking = true;

		// Add user message to store
		conversationStore.addMessage({ role: 'user', content: query });
		if ($conversationStore && $conversationStore?.messages?.length === 1) {
			$conversationStore.description = query;
		}
		const response = await fetch(`/chat/${data.project?._id}/${$conversationStore?._id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ input: query })
		});

		try {
			const response_data = await response.json();
			if (response_data?.message) {
				conversationStore.addMessage(response_data.message);
			} else {
				throw new Error('No message in response');
			}
		} catch (error) {
			console.error('Error reading response', error);
			conversationStore.addMessage({
				role: 'assistant',
				content: 'Oh dear, I failed to get a response. Please try again.',
				error: true,
				failedQuery: query
			});
		} finally {
			thinking = false;
			document.getElementById('input')?.focus();
		}
	}

	async function resubmit(query: string) {
		input = query;
		const event = new SubmitEvent('submit');
		await handleSubmit(event);
	}

	$: if ($conversationStore) {
		conversationsStore.upsert($conversationStore);
	}
</script>

<div class="flex flex-col bg-white dark:bg-gray-900">
	<!-- Chat messages -->
	<div class="flex-1 overflow-y-auto p-6 space-y-4 mb-[76px]">
		{#if !$conversationStore?.messages?.length}
			<div class="flex justify-center items-center h-full flex-col space-y-6">
				<p class="text-gray-600 dark:text-gray-400 text-lg">
					Start a conversation with your documents.
				</p>
				<div class="text-gray-700 dark:text-gray-500 text-sm space-y-2">
					<p class="font-medium mb-2">Try asking:</p>
					<div class="grid gap-2 w-full max-w-lg">
						<button
							class="w-full text-left px-4 py-3 rounded-lg bg-gray-100/50 hover:bg-gray-200 dark:bg-gray-800/50 dark:hover:bg-gray-800
							border border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 transition-all duration-200
							text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
							on:click={() => handleSampleQuestion('What is this document about?')}
						>
							"What is this document about?"
						</button>
						<button
							class="w-full text-left px-4 py-3 rounded-lg bg-gray-100/50 hover:bg-gray-200 dark:bg-gray-800/50 dark:hover:bg-gray-800
							border border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 transition-all duration-200
							text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
							on:click={() =>
								handleSampleQuestion('Who are the key people mentioned in this document?')}
						>
							"Who are the key people mentioned in this document?"
						</button>
						<button
							class="w-full text-left px-4 py-3 rounded-lg bg-gray-100/50 hover:bg-gray-200 dark:bg-gray-800/50 dark:hover:bg-gray-800
							border border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 transition-all duration-200
							text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
							on:click={() => handleSampleQuestion('What are the main topics discussed?')}
						>
							"What are the main topics discussed?"
						</button>
						<button
							class="w-full text-left px-4 py-3 rounded-lg bg-gray-100/50 hover:bg-gray-200 dark:bg-gray-800/50 dark:hover:bg-gray-800
							border border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 transition-all duration-200
							text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
							on:click={() => handleSampleQuestion('Can you summarize this document?')}
						>
							"Can you summarize this document?"
						</button>
					</div>
				</div>
			</div>
		{:else}
			{#each $conversationStore?.messages ?? [] as message}
				<ChatMessage {message} projectId={data.project._id} onResubmit={resubmit} />
			{/each}
		{/if}
		{#if thinking}
			<div class="flex justify-start">
				<div
					class="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg py-2 px-4"
				>
					<p class="text-sm">Thinking...</p>
				</div>
			</div>
		{/if}
	</div>

	<!-- Input area - fixed at bottom -->
	<div
		class="fixed bottom-0 right-0 lg:left-72 left-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
	>
		<form
			method="POST"
			on:submit|preventDefault={handleSubmit}
			action="?/chat"
			class="flex space-x-4 max-w-[100rem] mx-auto px-4"
		>
			<input
				id="input"
				type="text"
				placeholder="Type a message"
				bind:value={input}
				disabled={thinking}
				class="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2
                       text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500"
				autocomplete="off"
			/>
			{#if !thinking}
				<button
					type="submit"
					class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           focus:ring-offset-white dark:focus:ring-offset-gray-900 transition-colors"
				>
					Send
				</button>
			{:else}
				<button
					type="button"
					class="rounded-lg bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700
                           focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2
                           focus:ring-offset-white dark:focus:ring-offset-gray-900 transition-colors"
				>
					Cancel
				</button>
			{/if}
		</form>
	</div>
</div>
