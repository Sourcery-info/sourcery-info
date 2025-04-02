// Copyright (C) 2025 Jason Norwood-Young
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
            entities.map(e => {
                if (e._id === entityId) {
                    // Only update if the new version is higher or if versions are undefined
                    const existingVersion = e.__v ?? 0;
                    const newVersion = data.__v ?? 0;
                    if (newVersion >= existingVersion) {
                        return { ...e, ...data };
                    }
                    return e;
                }
                return e;
            })
        ),
        upsert: (entity: Entity) => {
            update(entities => {
                const index = entities.findIndex(e => e._id === entity._id);
                if (index !== -1) {
                    // Only update if the new version is higher or if versions are undefined
                    const existingVersion = entities[index].__v ?? 0;
                    const newVersion = entity.__v ?? 0;
                    if (newVersion >= existingVersion) {
                        entities[index] = { ...entities[index], ...entity };
                    }
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