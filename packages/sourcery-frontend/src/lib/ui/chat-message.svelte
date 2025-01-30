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
	<div class="flex justify-end">
		<div class="bg-blue-600 text-white rounded-lg py-2 px-4 max-w-[80%]">
			<p class="text-sm">{message.content}</p>
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
