<script lang="ts">
	import type { Conversation as ConversationType } from '@sourcery/common/types/Conversation.type.js';
	import type { Project as ProjectType } from '@sourcery/common/types/Project.type.js';
	import { marked } from 'marked';
	import type { TChunk } from '@sourcery/common/types/Chunks.type';
	import SourceChunks from '$lib/ui/source-chunks.svelte';

	export let data: {
		conversation: ConversationType;
		project: ProjectType;
	};

	marked.setOptions({
		gfm: true,
		breaks: true
	});

	let content = '';
	let input = '';
	let thinking = false;

	async function handleSampleQuestion(question: string) {
		input = question;
		const event = new SubmitEvent('submit');
		await handleSubmit(event);
	}

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
						data.conversation.messages.push({ role: 'assistant', content: content });
					content = '';
					break;
				}
				content += value;
			}
		} catch (error) {
			console.error('Error reading response', error);
		} finally {
			thinking = false;
			data.conversation.messages = data.conversation.messages;
			document.getElementById('input')?.focus();
		}
	}

	function renderMarkdown(markdown: string) {
		return marked(markdown);
	}
</script>

<div class="flex flex-col bg-gray-900">
	<!-- Chat messages -->
	<div class="flex-1 overflow-y-auto p-6 space-y-4 mb-[76px]">
		{#if !data.conversation?.messages?.length}
			<div class="flex justify-center items-center h-full flex-col space-y-6">
				<p class="text-gray-400 text-lg">Start a conversation with your documents.</p>
				<div class="text-gray-500 text-sm space-y-2">
					<p class="font-medium mb-2">Try asking:</p>
					<div class="grid gap-2 w-full max-w-lg">
						<button
							class="w-full text-left px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-800
							border border-gray-700 hover:border-gray-600 transition-all duration-200
							text-gray-400 hover:text-gray-200"
							on:click={() => handleSampleQuestion('What is this document about?')}
						>
							"What is this document about?"
						</button>
						<button
							class="w-full text-left px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-800
							border border-gray-700 hover:border-gray-600 transition-all duration-200
							text-gray-400 hover:text-gray-200"
							on:click={() =>
								handleSampleQuestion('Who are the key people mentioned in this document?')}
						>
							"Who are the key people mentioned in this document?"
						</button>
						<button
							class="w-full text-left px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-800
							border border-gray-700 hover:border-gray-600 transition-all duration-200
							text-gray-400 hover:text-gray-200"
							on:click={() => handleSampleQuestion('What are the main topics discussed?')}
						>
							"What are the main topics discussed?"
						</button>
						<button
							class="w-full text-left px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-800
							border border-gray-700 hover:border-gray-600 transition-all duration-200
							text-gray-400 hover:text-gray-200"
							on:click={() => handleSampleQuestion('Can you summarize this document?')}
						>
							"Can you summarize this document?"
						</button>
					</div>
				</div>
			</div>
		{:else}
			{#each data.conversation?.messages ?? [] as message}
				{#if message.role === 'user'}
					<div class="flex justify-end">
						<div class="bg-blue-600 text-white rounded-lg py-2 px-4 max-w-[80%]">
							<p class="text-sm">{message.content}</p>
						</div>
					</div>
				{/if}
				{#if message.role === 'assistant'}
					{#if message.chunks && message.chunks.length > 0}
						<SourceChunks chunks={message.chunks} project_id={data.project?._id} />
					{/if}
					<div class="flex justify-start">
						<div class="bg-gray-800 text-gray-100 shadow-lg rounded-lg py-2 px-4 max-w-[80%]">
							<p class="text-sm font-mono prose prose-invert prose-sm max-w-none">
								{@html renderMarkdown(message.content)}
							</p>
						</div>
					</div>
				{/if}
			{/each}
		{/if}
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
					<p class="text-sm font-mono prose prose-invert prose-sm max-w-none">
						{@html renderMarkdown(content)}
					</p>
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
				autocomplete="off"
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
