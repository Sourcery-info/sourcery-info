import { MembershipModel } from '@sourcery/common/src/models/Membership.model';
import mongoose from 'mongoose';
import type { Membership } from '@sourcery/common/types/Membership.type';

function mapDBMembership(membership: mongoose.Document<any, any, any> & Membership) {
    return {
        _id: membership._id.toString(),
        name: membership.name,
        document_limit: membership.document_limit,
        page_limit: membership.page_limit,
        created_at: membership.created_at,
        updated_at: membership.updated_at
    };
}

export async function getMembershipById(membership_id: string) {
    const membership = await MembershipModel.findById(membership_id);
    if (!membership) {
        return null;
    }
    return mapDBMembership(membership);
}

export async function createMembership(membership: Omit<Membership, '_id' | 'createdAt' | 'updatedAt'>) {
    const new_membership = new MembershipModel(membership);
    await new_membership.save();
    return mapDBMembership(new_membership);
}

export async function updateMembership(membership: Membership) {
    const updated_membership = await MembershipModel.findByIdAndUpdate(membership._id, membership, { new: true });
    if (!updated_membership) {
        return null;
    }
    return mapDBMembership(updated_membership);
}

export async function getAllMemberships() {
    const memberships = await MembershipModel.find();
    return memberships.map(mapDBMembership);
} 

export async function checkUniqueName(name: string, _id: string | undefined = undefined) {
    const membership = await MembershipModel.findOne({ name, _id: { $ne: _id } });
    return !membership;
}