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
import type { TAlert } from '@sourcery/common/types/Alert.type';

function createAlertsStore() {
    const { subscribe, set, update } = writable<TAlert[]>([]);

    return {
        subscribe,
        set,
        update,
        // Add a conversation
        add: (alert: TAlert) => update(alerts => [...alerts, alert]),
        // Remove a conversation
        remove: (alertId: string) => update(alerts => alerts.filter(a => a._id !== alertId)),
        // Update a conversation
        updateOne: (alertId: string, data: Partial<TAlert>) => update(alerts => 
            alerts.map(a => {
                if (a._id === alertId) {
                    // Only update if the new version is higher or if versions are undefined
                    const existingVersion = a.__v ?? 0;
                    const newVersion = data.__v ?? 0;
                    if (newVersion >= existingVersion) {
                        return { ...a, ...data };
                    }
                    return a;
                }
                return a;
            })
        ),
        upsert: (alert: TAlert) => {
            update(alerts => {
                const index = alerts.findIndex(a => a._id === alert._id);
                if (index !== -1) {
                    // Only update if the new version is higher or if versions are undefined
                    const existingVersion = alerts[index].__v ?? 0;
                    const newVersion = alert.__v ?? 0;
                    if (newVersion >= existingVersion) {
                        alerts[index] = { ...alerts[index], ...alert };
                    }
                } else {
                    alerts.unshift(alert);
                }
                return alerts;
            });
        },
        // Reset store
        reset: () => set([])
    };
}

export const alertsStore = createAlertsStore(); 