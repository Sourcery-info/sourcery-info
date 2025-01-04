<script lang="ts">
	// @ts-nocheck
	/** @type {import('./$types').PageData} */
	export let data;
</script>

<div class="min-h bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
	<div class="max-w-7xl mx-auto">
		<h1 class="text-2xl font-bold text-white mb-8">All Entities for Project {data.project.name}</h1>

		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each data.entities as entity}
				<a
					href="/entity/{entity.project_id}/{entity._id}"
					class="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
				>
					<div class="text-md text-white mb-2">
						<div class="flex flex-row gap-2 items-center">
							<div class="bg-blue-800 text-gray-300 text-xs px-2 py-1 rounded-md w-fit">Entity</div>
							<div class="bg-red-800 text-white-300 text-xs px-2 py-1 rounded-md w-fit">
								{entity.type}
							</div>
						</div>
						<div class="text-md text-white mt-2">
							{entity.value}
							<div class="text-sm text-gray-400 mt-1">
								{entity.chunk_ids.length} chunk{entity.chunk_ids.length > 1 ? 's' : ''}
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>
</div>
