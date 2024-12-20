<script lang="ts">
	import { onMount } from 'svelte';
	import type { Message as MessageType } from '@sourcery/common/types/Message.type.js';
	import type { Conversation as ConversationType } from '@sourcery/common/types/Conversation.type.js';
	import type { Project as ProjectType } from '@sourcery/common/types/Project.type.js';
	export let data: {
		conversation: ConversationType;
		project: ProjectType;
	};

	let content = '';
	let input = '';
	let thinking = false;

	async function handleSubmit(event: SubmitEvent) {
		if (input === '') return;
		event.preventDefault();
		const query = input;
		input = '';
		thinking = true;
		if (data.conversation.messages)
			data.conversation.messages.push({ role: 'user', content: query });
		data.conversation.messages = data.conversation.messages;
		const response = await fetch(`/chat/${data.project?._id}/${data.conversation?._id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ input: query })
		});
		try {
			const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
			if (!reader) throw new Error('No reader');
			while (true) {
				const { done, value } = await reader.read();
				thinking = false;
				if (done) {
					if (data.conversation.messages)
						data.conversation.messages.push({ role: 'assistant', content });
					content = '';
					break;
				}
				content += value.replace(/\n/g, '<br>');
			}
		} catch (error) {
			console.error('Error reading response', error);
		} finally {
			thinking = false;
			data.conversation.messages = data.conversation.messages;
			document.getElementById('input')?.focus();
		}
	}
</script>

<div class="flex flex-col bg-gray-900">
	<!-- Chat messages -->
	<div class="flex-1 overflow-y-auto p-6 space-y-4 mb-[76px]">
		{#each data.conversation?.messages ?? [] as message}
			{#if message.role === 'user'}
				<div class="flex justify-end">
					<div class="bg-blue-600 text-white rounded-lg py-2 px-4 max-w-[80%]">
						<p class="text-sm">{message.content}</p>
					</div>
				</div>
			{/if}
			{#if message.role === 'assistant'}
				<div class="flex justify-start">
					<div class="bg-gray-800 text-gray-100 shadow-lg rounded-lg py-2 px-4 max-w-[80%]">
						<p class="text-sm font-mono">{@html message.content}</p>
					</div>
				</div>
			{/if}
		{/each}
		{#if thinking}
			<div class="flex justify-start">
				<div class="bg-gray-800 text-gray-300 rounded-lg py-2 px-4">
					<p class="text-sm">Thinking...</p>
				</div>
			</div>
		{/if}
		{#if content}
			<div class="flex justify-start">
				<div class="bg-gray-800 text-gray-100 shadow-lg rounded-lg py-2 px-4 max-w-[80%]">
					<p class="text-sm font-mono">{@html content}</p>
				</div>
			</div>
		{/if}
	</div>

	<!-- Input area - fixed at bottom -->
	<div class="fixed bottom-0 right-0 lg:left-72 left-0 border-t border-gray-700 bg-gray-900 p-4">
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
				class="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-gray-100 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       disabled:bg-gray-700 disabled:text-gray-500"
			/>
			{#if !thinking}
				<button
					type="submit"
					class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           focus:ring-offset-gray-900 transition-colors"
				>
					Send
				</button>
			{:else}
				<button
					type="button"
					class="rounded-lg bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700
                           focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2
                           focus:ring-offset-gray-900 transition-colors"
				>
					Cancel
				</button>
			{/if}
		</form>
	</div>
</div>
