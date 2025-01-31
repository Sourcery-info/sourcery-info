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