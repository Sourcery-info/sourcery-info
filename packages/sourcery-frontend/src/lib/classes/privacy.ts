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
