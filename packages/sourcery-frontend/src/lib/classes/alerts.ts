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

import { AlertModel } from '@sourcery/common/src/models/Alert.model';
import type { TAlert } from '@sourcery/common/types/Alert.type';
import { SourceryPub } from '@sourcery/queue/src/pub.js';
const pub = new SourceryPub(`sourcery.info-ws`);

async function pubAlert(alert: TAlert): Promise<void> {
    if (!alert._id) {
        return;
    }
    const alert_db = await getAlert(alert._id);
    pub.addJob(`${alert_db.user_id}:alert`, { alert: alert_db });
}

function mapDBAlert(alert: TAlert): TAlert {
    return {
        _id: alert._id?.toString(),
        user_id: alert.user_id?.toString() || '',
        seen: alert.seen,
        message: alert.message,
        type: alert.type,
        created_at: alert.created_at,
        updated_at: alert.updated_at
    }
}

export async function getAlerts(user_id: string): Promise<TAlert[]> {
    const alerts = await AlertModel.find({ user_id: user_id.toString() }).sort({ created_at: -1 });
    return alerts.map(mapDBAlert);
}

export async function getAlert(alert_id: string): Promise<TAlert> {
    const alert = await AlertModel.findById(alert_id);
    if (!alert) {
        throw new Error('Alert not found');
    }
    return mapDBAlert(alert);
}

export async function createAlert(alert: TAlert): Promise<TAlert> {
    delete(alert._id);
    const newAlert = await AlertModel.create(alert);
    pubAlert(newAlert);
    return mapDBAlert(newAlert);
}

export async function updateAlert(alert: TAlert): Promise<TAlert> {
    const updatedAlert = await AlertModel.findByIdAndUpdate(alert._id, alert, { new: true });
    if (!updatedAlert) {
        throw new Error('Alert not found');
    }
    pubAlert(updatedAlert);
    return mapDBAlert(updatedAlert);
}

export async function deleteAlert(alert_id: string): Promise<void> {
    const deletedAlert = await AlertModel.findByIdAndDelete(alert_id);
    if (!deletedAlert) {
        throw new Error('Alert not found');
    }
    pubAlert(deletedAlert);
}

export async function markAlertsSeen(user_id: string): Promise<void> {
    const alerts = await AlertModel.updateMany(
        { user_id: user_id.toString(), seen: false },
        { seen: true }
    );
    const updatedAlerts = await getAlerts(user_id);
    updatedAlerts.forEach(alert => pubAlert(alert));
}
