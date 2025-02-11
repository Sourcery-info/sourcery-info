<script lang="ts">
	import type { TermsAndConditions } from '@sourcery/common/types/TermsAndConditions.type';
	import { enhance } from '$app/forms';
	import SuccessAlert from '$lib/ui/success-alert.svelte';
	import Alert from '$lib/ui/alert.svelte';
	import type { ActionResult } from '@sveltejs/kit';
	import { marked } from 'marked';
	import { goto } from '$app/navigation';
	import { incrementVersion } from '$lib/utils/versions';
	export let data: { latestVersion: string; nextVersion: string; latestContent: string };
	export let form: {
		message?: string;
		errors?: { [key: string]: string };
		data?: Partial<TermsAndConditions>;
	} | null;

	let terms: Partial<TermsAndConditions> = {
		version: data.nextVersion,
		content: '',
		active: false
	};
	let showSuccess = false;
	let showPreview = false;

	function handleMajorVersionBump() {
		terms.version = incrementVersion(data.latestVersion, 'major');
	}

	$: previewHtml = terms.content ? marked(terms.content) : '';

	function handleSubmit() {
		return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			await update();

			if (result.type === 'success') {
				showSuccess = true;
				//  Wait for 2 seconds before redirecting
				// setTimeout(() => {
				goto('/admin/terms');
				// }, 2000);
			}
		};
	}

	$: if (form?.data) {
		terms = form.data; // Keep our server-generated version
	} else {
		terms = {
			version: data.nextVersion,
			content: data.latestContent,
			active: false
		};
	}
</script>

<div class="min-h-full">
	<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		<h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
			Create New Terms & Conditions
		</h1>
	</div>

	<main>
		<div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
			{#if form?.errors?.server}
				<Alert variant="error" title="Error" dismissible>
					{form.errors.server}
				</Alert>
			{/if}

			<form method="POST" use:enhance={handleSubmit} class="space-y-6">
				<div>
					<label
						for="version"
						class="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
					>
						Version
					</label>
					<div class="mt-2">
						<input
							type="text"
							id="version"
							name="version"
							value={terms.version || data.nextVersion}
							class="block w-full rounded-lg border-0 bg-white dark:bg-white/5 px-4 py-2.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-200 cursor-not-allowed sm:text-sm sm:leading-6"
						/>
						<div class="mt-2 flex items-center justify-between">
							<p class="text-sm text-gray-500 dark:text-gray-400">
								Next version after {data.latestVersion}
							</p>
							<button
								type="button"
								on:click={handleMajorVersionBump}
								class="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
							>
								Major version bump
							</button>
						</div>
					</div>
				</div>

				<div>
					<label
						for="content"
						class="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
					>
						Content
					</label>
					<div class="mt-2 space-y-4">
						<div class="flex justify-end">
							<button
								type="button"
								on:click={() => (showPreview = !showPreview)}
								class="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
							>
								{showPreview ? 'Hide Preview' : 'Show Preview'}
							</button>
						</div>

						<div class="grid {showPreview ? 'grid-cols-2 gap-4' : 'grid-cols-1'}">
							<div>
								<textarea
									id="content"
									name="content"
									rows="20"
									required
									bind:value={terms.content}
									class="block w-full rounded-lg border-0 bg-white dark:bg-white/5 px-4 py-2.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-white/10 sm:text-sm sm:leading-6"
									class:ring-red-500={form?.errors?.content}
								></textarea>
								{#if form?.errors?.content}
									<p class="mt-2 text-sm text-red-600 dark:text-red-500">
										{form.errors.content}
									</p>
								{/if}
							</div>

							{#if showPreview}
								<div
									class="prose dark:prose-invert max-w-none bg-gray-100/50 dark:bg-gray-800/50 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 overflow-y-auto"
									style="height: 500px;"
								>
									{@html previewHtml}
								</div>
							{/if}
						</div>
					</div>
				</div>

				<div class="relative flex items-start">
					<div class="flex h-6 items-center">
						<input
							id="active"
							name="active"
							type="checkbox"
							bind:checked={terms.active}
							value={1}
							class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-indigo-500 dark:focus:ring-indigo-500"
						/>
					</div>
					<div class="ml-3 text-sm leading-6">
						<label for="active" class="font-medium text-gray-900 dark:text-white">Active</label>
						<p class="text-gray-500 dark:text-gray-400">
							Make this the active version that users must accept
						</p>
					</div>
				</div>

				<div class="flex justify-end space-x-4">
					<a
						href="/admin/terms"
						class="rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
					>
						Cancel
					</a>
					<button
						type="submit"
						class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed relative"
					>
						Create
					</button>
				</div>
			</form>
		</div>
	</main>
</div>

<SuccessAlert bind:show={showSuccess} message="Terms & Conditions created successfully" />

<style>
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
