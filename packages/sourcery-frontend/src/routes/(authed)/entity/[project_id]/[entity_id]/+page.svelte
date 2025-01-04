<script lang="ts">
	// @ts-nocheck
	/** @type {import('./$types').PageData} */
	export let data;
</script>

<div class="text-white">
	<div class="flex flex-row gap-2 mb-4">
		<h1 class="text-2xl font-bold">
			{data.entity.value}
		</h1>
		<div class="flex flex-row gap-2 items-center">
			<div class="bg-blue-800 text-gray-300 text-sm px-2 py-1 rounded-md w-fit">Entity</div>
			<div class="bg-red-800 text-white-300 text-sm px-2 py-1 rounded-md w-fit">
				{data.entity.type}
			</div>
		</div>
	</div>
	<div class="flex flex-col gap-4">
		{#each data.chunks as chunk}
			<div class="bg-gray-800 rounded-lg p-4 shadow-lg">
				<div class="text-md text-white mb-2">{chunk.content}</div>
				<div class="text-sm text-gray-400">{chunk.context}</div>
			</div>
		{/each}
	</div>
</div>
