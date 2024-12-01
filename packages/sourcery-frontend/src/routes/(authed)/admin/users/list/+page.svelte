<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data;
</script>

<h1 class="text-2xl font-bold mb-4 dark:text-white">Users</h1>

<p class="mb-6 dark:text-gray-300">Total users: {data.userCount}</p>

<div class="grid gap-4">
	<!-- Header -->
	<div
		class="grid grid-cols-4 font-semibold bg-gray-100 dark:bg-gray-800 p-4 rounded-t-lg dark:text-gray-200"
	>
		<div>Username</div>
		<div>Approved</div>
		<div>Admin</div>
		<div>Actions</div>
	</div>

	<!-- Grid Items -->
	{#each data.users as user}
		<div
			class="grid grid-cols-4 p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-300"
		>
			<div>{user.username}</div>
			<div>{user.approved ? 'Approved' : 'Pending'}</div>
			<div>{user.admin ? 'Admin' : 'User'}</div>
			<div>
				<a
					href={`/admin/users/edit/${user.user_id}`}
					class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
				>
					Edit
				</a>
			</div>
		</div>
	{/each}
</div>
