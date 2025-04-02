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

import { PrivacyPolicyModel } from '@sourcery/common/src/models/PrivacyPolicy.model';
import type { PrivacyPolicy } from '@sourcery/common/types/PrivacyPolicy.type';

function mapDBPrivacyPolicy(policy: PrivacyPolicy): PrivacyPolicy {
    return {
        _id: policy._id?.toString(),
        version: policy.version,
        content: policy.content,
        active: policy.active,
        created_at: policy.created_at,
        updated_at: policy.updated_at
    };
}

export async function getActivePrivacyPolicy(): Promise<PrivacyPolicy | null> {
    const policy = await PrivacyPolicyModel.findOne({ active: true });
    if (!policy) {
        return null;
    }
    return mapDBPrivacyPolicy(policy);
}

export async function getPrivacyPolicyById(policy_id: string): Promise<PrivacyPolicy | null> {
    const policy = await PrivacyPolicyModel.findById(policy_id);
    if (!policy) {
        return null;
    }
    return mapDBPrivacyPolicy(policy);
}

export async function createPrivacyPolicy(policy: Omit<PrivacyPolicy, '_id' | 'created_at' | 'updated_at'>): Promise<PrivacyPolicy> {
    // If this is marked as active, deactivate all other versions
    if (policy.active) {
        await PrivacyPolicyModel.updateMany({}, { active: false });
    }
    
    const newPolicy = await PrivacyPolicyModel.create(policy);
    return mapDBPrivacyPolicy(newPolicy);
}

export async function updatePrivacyPolicy(policy: PrivacyPolicy): Promise<PrivacyPolicy> {
    // If this is being marked as active, deactivate all other versions
    if (policy.active) {
        await PrivacyPolicyModel.updateMany({ _id: { $ne: policy._id } }, { active: false });
    }
    
    const updatedPolicy = await PrivacyPolicyModel.findByIdAndUpdate(policy._id, policy, { new: true });
    if (!updatedPolicy) {
        throw new Error('Privacy Policy not found');
    }
    return mapDBPrivacyPolicy(updatedPolicy);
}

export async function getAllPrivacyPolicyVersions(): Promise<PrivacyPolicy[]> {
    const policies = await PrivacyPolicyModel.find().sort({ created_at: -1 });
    return policies.map(mapDBPrivacyPolicy);
}
