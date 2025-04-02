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