<script lang="ts">
	import type { Entity } from '@sourcery/common/types/Entities.type';
	import { entitiesStore } from '$lib/stores/entities';
	import EntityCard from '$lib/ui/entity-card.svelte';

	export let data;

	let entities: Entity[] = [];

	$: entities = $entitiesStore.filter((entity) => entity.file_ids?.includes(data.props.file._id));
</script>

<div class="p-6">
	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each entities as entity}
			<EntityCard {entity} />
		{/each}
	</div>
</div>
