<script lang="ts">
	import { enhance } from '$app/forms';
	import type { InviteCode } from '@sourcery/common/types/InviteCode.type';
	import type { Membership } from '@sourcery/common/types/Membership.type';
	import { page } from '$app/stores';

	export let data: {
		memberships: Membership[];
		invite_codes: InviteCode[];
	};

	export let form;

	let selectedMembershipId = data.memberships[0]?._id || '';
	let emails = '';
	let send_email = true;

	$: invite_codes = data.invite_codes;

	$: console.log(invite_codes);
</script>

<div class="px-4 sm:px-6 lg:px-8">
	<div class="sm:flex sm:items-center">
		<div class="sm:flex-auto">
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">Invite Codes</h1>
			<p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
				Generate and manage invite codes for new users.
			</p>
		</div>
	</div>

	<form method="POST" use:enhance class="mt-8 space-y-6 max-w-2xl">
		<div>
			<label for="emails" class="block text-sm font-medium text-gray-900 dark:text-white">
				Email Addresses (one per line)
			</label>
			<div class="mt-2">
				<textarea
					id="emails"
					name="emails"
					rows="5"
					bind:value={emails}
					class="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-white/10 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6 bg-white dark:bg-white/5"
					placeholder="user1@example.com&#10;user2@example.com"
				></textarea>
			</div>
			{#if form?.errors?.emails}
				<p class="mt-2 text-sm text-red-600 dark:text-red-500">{form.errors.emails}</p>
			{/if}
		</div>

		<div>
			<label for="membershipId" class="block text-sm font-medium text-gray-900 dark:text-white">
				Membership Type
			</label>
			<select
				id="membership_id"
				name="membership_id"
				bind:value={selectedMembershipId}
				class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-white/10 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6 bg-white dark:bg-white/5"
			>
				{#each data.memberships as membership}
					<option value={membership._id}>{membership.name}</option>
				{/each}
			</select>
			{#if form?.errors?.membership_id}
				<p class="mt-2 text-sm text-red-600 dark:text-red-500">{form.errors.membership_id}</p>
			{/if}
		</div>

		<div class="relative flex items-start">
			<div class="flex h-6 items-center">
				<input
					id="send_email"
					name="send_email"
					type="checkbox"
					bind:checked={send_email}
					value="1"
					class="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-600 dark:focus:ring-indigo-500"
				/>
			</div>
			<div class="ml-3 text-sm leading-6">
				<label for="sendEmail" class="font-medium text-gray-900 dark:text-white">
					Send email invitations
				</label>
				<p class="text-gray-500 dark:text-gray-400">
					Automatically send invitation emails to the specified addresses
				</p>
			</div>
		</div>

		<div>
			<button
				type="submit"
				class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
			>
				Generate Invite Codes
			</button>
		</div>
	</form>

	<div class="mt-8 flow-root">
		<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
			<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
				<table class="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
					<thead>
						<tr>
							<th
								scope="col"
								class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-0"
								>Email</th
							>
							<th
								scope="col"
								class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
								>Code</th
							>
							<th
								scope="col"
								class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
								>Status</th
							>
							<th
								scope="col"
								class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
								>Expires</th
							>
							<th
								scope="col"
								class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
								>Used At</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 dark:divide-gray-800">
						{#each invite_codes as invite}
							<tr>
								<td
									class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-0"
								>
									{invite.email}
								</td>
								<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
									{invite.code}
								</td>
								<td class="whitespace-nowrap px-3 py-4 text-sm">
									{#if invite.used}
										<span
											class="inline-flex items-center rounded-md bg-green-50 dark:bg-green-400/10 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/20"
											>Used</span
										>
									{:else if new Date(invite.expires_at) < new Date()}
										<span
											class="inline-flex items-center rounded-md bg-red-50 dark:bg-red-400/10 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-400/20"
											>Expired</span
										>
									{:else if invite.was_emailed}
										<span
											class="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-400/20"
											>Sent</span
										>
									{:else}
										<span
											class="inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-500/20 dark:ring-gray-400/20"
											>Pending</span
										>
									{/if}
								</td>
								<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
									{new Date(invite.expires_at).toLocaleDateString()}
								</td>
								<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
									{invite.used_at ? new Date(invite.used_at).toLocaleString() : '-'}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
