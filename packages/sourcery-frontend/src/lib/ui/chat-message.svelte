<script lang="ts">
	import { Marked } from 'marked';
	import { slide } from 'svelte/transition';
	import SourceChunks from './source-chunks.svelte';
	import type { Message } from '@sourcery/common/types/Message.type.js';

	export let message: Message;
	export let projectId: string;
	export let onResubmit: (query: string) => void;

	const parser = new Marked({
		gfm: true,
		breaks: true
	});

	let isThinkingVisible = false;
	let processedContent: { mainContent: string; thinkingContent: string | null } = {
		mainContent: '',
		thinkingContent: null
	};

	$: {
		const thinkingPattern = /<think>([\s\S]*?)<\/think>/g;
		const mainContent = message.content.replace(thinkingPattern, '').trim();
		const thinkingMatch = thinkingPattern.exec(message.content);

		processedContent = {
			mainContent: parser.parse(mainContent) as string,
			thinkingContent: thinkingMatch ? (parser.parse(thinkingMatch[1].trim()) as string) : null
		};
	}
</script>

{#if message.role === 'user'}
	<div class="flex justify-end group">
		<div class="bg-blue-600 text-white rounded-lg py-2 px-4 max-w-[80%] relative">
			<p class="text-sm">{message.content}</p>
			<div
				class="absolute -left-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2"
			>
				<button
					class="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
					aria-label="Rerun this message"
					title="Rerun this message"
					on:click={() => onResubmit(message.content)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
				<button
					class="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
					aria-label="Edit and rerun this message"
					title="Edit and rerun this message"
					on:click={() => {
						const input = document.getElementById('input') as HTMLInputElement;
						if (input) {
							input.value = message.content;
							input.focus();
						}
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>
{:else if message.role === 'assistant'}
	<div class="flex flex-col space-y-2">
		{#if message.chunks && message.chunks.length > 0}
			<div class="w-full">
				<SourceChunks chunks={message.chunks} project_id={projectId} />
			</div>
		{/if}
		<div class="flex justify-start">
			<div
				class="message-container bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg rounded-lg py-2 px-4 max-w-[80%]"
			>
				<div class="text-sm font-mono prose dark:prose-invert prose-sm max-w-none">
					{@html processedContent.mainContent}
				</div>

				{#if processedContent.thinkingContent}
					<div class="mt-4">
						<button
							on:click={() => (isThinkingVisible = !isThinkingVisible)}
							class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
						>
							{isThinkingVisible ? 'Hide thinking' : 'Show thinking'}
						</button>

						{#if isThinkingVisible}
							<div class="thinking-section" transition:slide>
								{@html processedContent.thinkingContent}
							</div>
						{/if}
					</div>
				{/if}

				{#if message.error}
					<button
						class="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
						on:click={() => onResubmit(message.failedQuery ?? '')}
					>
						Try Again
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.thinking-section {
		margin-top: 0.5rem;
		padding: 0.5rem;
		border-left: 2px solid #4b5563;
		background-color: rgba(75, 85, 99, 0.1);
		font-style: italic;
	}
</style>
