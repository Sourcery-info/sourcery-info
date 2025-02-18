import { InviteCodeModel } from '@sourcery/common/src/models/InviteCode.model';
import type { InviteCode } from '@sourcery/common/types/InviteCode.type';
import mongoose from 'mongoose';
function mapDBInviteCode(inviteCode: mongoose.Document<any, any, any> & InviteCode) {
    return {
        _id: inviteCode._id.toString(),
        email: inviteCode.email,
        code: inviteCode.code,
        membership_id: inviteCode.membership_id,
        was_emailed: inviteCode.was_emailed,
        expires_at: inviteCode.expires_at,
        used: inviteCode.used,
        used_at: inviteCode.used_at,
    };
}

export async function createInviteCode(inviteCode: Omit<InviteCode, '_id' | 'created_at'> & Partial<Pick<InviteCode, '_id' | 'created_at'>>) {
    const newInviteCode = new InviteCodeModel(inviteCode);
    await newInviteCode.save();
    return mapDBInviteCode(newInviteCode);
}

export async function updateInviteCode(inviteCode: Partial<InviteCode>) {
    const updatedInviteCode = await InviteCodeModel.findByIdAndUpdate(inviteCode._id, inviteCode, { new: true });
    if (!updatedInviteCode) {
        return null;
    }
    return mapDBInviteCode(updatedInviteCode);
}

export async function getInviteCodeById(id: string) {
    const inviteCode = await InviteCodeModel.findById(mongoose.Types.ObjectId.createFromHexString(id));
    if (!inviteCode) {
        return null;
    }
    return mapDBInviteCode(inviteCode);
}

export async function getInviteCodeByCode(code: string) {
    const inviteCode = await InviteCodeModel.findOne({ code });
    if (!inviteCode) {
        return null;
    }
    return mapDBInviteCode(inviteCode);
}

export async function getAllInviteCodes() {
    const inviteCodes = await InviteCodeModel.find();
    return inviteCodes.map(mapDBInviteCode);
}