<!--
 Copyright (C) 2025 Jason Norwood-Young
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.
 
 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->

<script lang="ts">
	import type { Entity } from '@sourcery/common/types/Entities.type';
	import { entitiesStore } from '$lib/stores/entities.store';
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
