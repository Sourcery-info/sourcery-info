<script lang="ts">
	import type { PageData } from './$types';
	import { marked } from 'marked';

	export let data: PageData;
	$: content = marked(data.terms.content);
</script>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900">
	<div class="container mx-auto px-4 py-8 max-w-4xl">
		<h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Terms and Conditions</h1>
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
			<div class="text-sm text-gray-600 dark:text-gray-400 mb-4">
				Version: {data.terms.version} • Last Updated: {new Date(
					data.terms.updated_at
				).toLocaleDateString()}
			</div>
			<div class="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
				{@html content}
			</div>
			<div class="text-sm text-gray-600 dark:text-gray-400 mt-4">
				Last updated: {new Date(data.terms.updated_at).toLocaleDateString()}
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	:global(.prose) {
		@apply prose-headings:text-gray-900 dark:prose-headings:text-gray-100 
               prose-p:text-gray-700 dark:prose-p:text-gray-300 
               prose-a:text-blue-600 dark:prose-a:text-blue-400 
               prose-strong:text-gray-900 dark:prose-strong:text-gray-100 
               prose-code:text-gray-900 dark:prose-code:text-gray-100 
               prose-pre:bg-gray-50/50 dark:prose-pre:bg-gray-900/50
               prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300 
               prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-700
               prose-ul:text-gray-700 dark:prose-ul:text-gray-300 
               prose-ol:text-gray-700 dark:prose-ol:text-gray-300 
               prose-li:text-gray-700 dark:prose-li:text-gray-300;
	}
</style>
