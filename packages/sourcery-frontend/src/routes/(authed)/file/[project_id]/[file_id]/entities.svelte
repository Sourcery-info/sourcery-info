<script lang="ts">
	import { onMount } from 'svelte';
	import type { Entity } from '@sourcery/common/types/Entities.type';
	import EntityCard from '$lib/ui/entity-card.svelte';
	export let data;

	let entities: Entity[] = [];
	let entities_by_type: Record<string, Entity[]> = {};
	let expanded: Record<string, boolean> = {
		PERSON: false,
		ORGANIZATION: false,
		LOCATION: false,
		DATE: false,
		OTHER: false
	};

	onMount(async () => {
		const response = await fetch(
			`/file/${data.props.project_id}/${data.props.file._id}/view/entities`
		);
		entities = await response.json();
	});
</script>

<div class="p-6">
	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each entities as entity}
			<EntityCard {entity} />
		{/each}
	</div>
</div>
