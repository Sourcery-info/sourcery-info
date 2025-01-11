<script lang="ts">
	import { usersStore } from '$lib/stores/usersStore';

	/** @type {import('$types').PageData} */
</script>

<div class="px-4 sm:px-6 lg:px-8">
	<div class="sm:flex sm:items-center">
		<div class="sm:flex-auto">
			<h1 class="text-base font-semibold text-gray-900 dark:text-white">Users</h1>
			<p class="mt-2 text-sm text-gray-700 dark:text-gray-300">
				A list of all users in your account including their username, email, approval status, and
				role.
			</p>
		</div>
		<div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
			<a
				href="/admin/users/new"
				class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
			>
				Add user
			</a>
		</div>
	</div>

	<div class="mt-8 flow-root">
		<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
			<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
				<div class="overflow-hidden shadow ring-1 ring-black/5 dark:ring-white/10 sm:rounded-lg">
					<table class="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
						<thead class="bg-gray-50 dark:bg-gray-800">
							<tr>
								<th
									scope="col"
									class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-6"
								>
									Username
								</th>
								<th
									scope="col"
									class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
								>
									Email
								</th>
								<th
									scope="col"
									class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
								>
									Status
								</th>
								<th
									scope="col"
									class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200"
								>
									Role
								</th>
								<th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
									<span class="sr-only">Edit</span>
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
							{#each $usersStore as user}
								<tr>
									<td
										class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-200 sm:pl-6"
									>
										{user.username}
									</td>
									<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
										{user.email}
									</td>
									<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
										{user.approved ? 'Approved' : 'Pending'}
									</td>
									<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
										{user.admin ? 'Admin' : 'User'}
									</td>
									<td
										class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
									>
										<a
											href={`/admin/users/edit/${user._id}`}
											class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
										>
											Edit<span class="sr-only">, {user.username}</span>
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>
