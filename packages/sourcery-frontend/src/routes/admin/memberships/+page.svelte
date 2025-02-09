<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { Membership } from '@sourcery/common/types/Membership.type';

	let memberships: Membership[] = [];

	onMount(() => {
		memberships = $page.data.memberships;
	});
</script>

<div class="container mx-auto">
	<h1 class="text-2xl font-bold mb-4">Memberships</h1>
	<table class="min-w-full bg-white">
		<thead>
			<tr>
				<th class="py-2">Name</th>
				<th class="py-2">Document Limit</th>
				<th class="py-2">Page Limit</th>
				<th class="py-2">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each memberships as membership}
				<tr>
					<td class="border px-4 py-2">{membership.name}</td>
					<td class="border px-4 py-2">{membership.document_limit}</td>
					<td class="border px-4 py-2">{membership.page_limit}</td>
					<td class="border px-4 py-2">
						<a
							href={`/admin/memberships/edit/${membership._id}`}
							class="text-blue-500 hover:underline">Edit</a
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<a
		href="/admin/memberships/new"
		class="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">Create New Membership</a
	>
</div>
