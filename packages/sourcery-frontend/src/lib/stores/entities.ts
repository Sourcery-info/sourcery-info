import { writable } from 'svelte/store';
import type { Entity } from '@sourcery/common/types/Entities.type';

function createEntitiesStore() {
    const { subscribe, set, update } = writable<Entity[]>([]);

    return {
        subscribe,
        set,
        update,
        // Add an entity
        add: (entity: Entity) => update(entities => [...entities, entity]),
        // Remove an entity
        remove: (entityId: string) => update(entities => entities.filter(e => e._id !== entityId)),
        // Update an entity
        updateOne: (entityId: string, data: Partial<Entity>) => update(entities => 
            entities.map(e => e._id === entityId ? { ...e, ...data } : e)
        ),
        upsert: (entity: Entity) => {
            update(entities => {
                const index = entities.findIndex(e => e._id === entity._id);
                if (index !== -1) {
                    entities[index] = { ...entities[index], ...entity };
                } else {
                    entities.unshift(entity);
                }
                return entities;
            });
        },
        // Reset store
        reset: () => set([])
    };
}

export const entitiesStore = createEntitiesStore(); 