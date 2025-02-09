<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import SuccessAlert from '$lib/ui/success-alert.svelte';
	import { goto } from '$app/navigation';
	let showSuccess = false;

	export let form: {
		message?: string;
		errors?: { [key: string]: string };
		data?: {
			name?: string;
			document_limit?: number;
			page_limit?: number;
		};
	} | null;

	$: membership = form?.data ?? {
		name: '',
		document_limit: 0,
		page_limit: 0
	};

	async function handleSubmit() {
		return async ({ result, update }: { result: ActionResult; update: () => Promise<void> }) => {
			await update();
			if (result.type === 'success') {
				showSuccess = true;
				goto('/admin/memberships');
			}
		};
	}
</script>

<div class="container mx-auto">
	<h1 class="text-2xl font-bold mb-4">Create Membership</h1>
	<form use:enhance={handleSubmit} method="post">
		<div class="mb-4">
			<label class="block text-gray-700" for="name">Name</label>
			<input
				type="text"
				name="name"
				bind:value={membership.name}
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
				min={-1}
				bind:value={membership.document_limit}
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
				min={-1}
				bind:value={membership.page_limit}
				class="w-full px-3 py-2 border rounded"
				required
			/>
			<p class="text-red-500">{form?.errors?.page_limit}</p>
		</div>
		<button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Create</button>
	</form>
</div>

<SuccessAlert bind:show={showSuccess} message="Membership created successfully" />
