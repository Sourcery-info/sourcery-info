<script lang="ts">
	import { enhance, applyAction } from '$app/forms';
	import SuccessAlert from '$lib/ui/success-alert.svelte';
	import type { ActionResult } from '@sveltejs/kit';
	import type { Membership } from '@sourcery/common/types/Membership.type';

	let showSuccess = $state(false);
	let { data, form } = $props();
	let membership: Membership = $derived(form?.data ?? data.membership) as Membership;

	async function handleSubmit() {
		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'success') {
				await applyAction(result);
				showSuccess = true;
			} else {
				await applyAction(result);
			}
		};
	}
</script>

<div class="container mx-auto">
	<h1 class="text-2xl font-bold mb-4">Edit Membership</h1>
	<form use:enhance={handleSubmit} method="post">
		<div class="mb-4">
			<label class="block text-gray-700" for="name">Name</label>
			<input
				type="text"
				name="name"
				value={membership.name ?? ''}
				class="w-full px-3 py-2 border rounded"
				required
			/>
			<p class="text-red-500">{form?.errors?.name}</p>
		</div>
		<div class="mb-4">
			<label class="block text-gray-700" for="document_limit">Document Limit</label>
			<input
				type="number"
				name="document_limit"
				value={membership.document_limit ?? 0}
				class="w-full px-3 py-2 border rounded"
				required
			/>
			<p class="text-red-500">{form?.errors?.document_limit}</p>
		</div>
		<div class="mb-4">
			<label class="block text-gray-700" for="page_limit">Page Limit</label>
			<input
				type="number"
				name="page_limit"
				value={membership.page_limit ?? 0}
				class="w-full px-3 py-2 border rounded"
				required
			/>
			<p class="text-red-500">{form?.errors?.page_limit}</p>
		</div>
		<button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
	</form>
</div>

<SuccessAlert bind:show={showSuccess} message="Membership updated successfully" />
