import { TermsAndConditionsModel, UserTermsAcceptanceModel } from '@sourcery/common/src/models/TermsAndConditions.model';
import type { TermsAndConditions, UserTermsAcceptance } from '@sourcery/common/types/TermsAndConditions.type';
import mongoose from 'mongoose';
import { logger } from '@sourcery/common/src/logger';

function mapDBTerms(terms: TermsAndConditions): TermsAndConditions {
    return {
        _id: terms._id?.toString(),
        version: terms.version,
        content: terms.content,
        active: terms.active,
        created_at: terms.created_at,
        updated_at: terms.updated_at
    };
}

function mapDBAcceptance(acceptance: UserTermsAcceptance): UserTermsAcceptance {
    return {
        _id: acceptance._id?.toString(),
        user_id: acceptance.user_id.toString(),
        terms_id: acceptance.terms_id.toString(),
        version: acceptance.version,
        ip_address: acceptance.ip_address,
        user_agent: acceptance.user_agent,
        accepted_at: acceptance.accepted_at
    };
}

export async function getActiveTerms(): Promise<TermsAndConditions | null> {
    const terms = await TermsAndConditionsModel.findOne({ active: true });
    if (!terms) {
        return null;
    }
    return mapDBTerms(terms);
}

export async function getTermsById(terms_id: string): Promise<TermsAndConditions | null> {
    const terms = await TermsAndConditionsModel.findById(terms_id);
    if (!terms) {
        return null;
    }
    return mapDBTerms(terms);
}

export async function createTerms(terms: Omit<TermsAndConditions, '_id' | 'created_at' | 'updated_at'>): Promise<TermsAndConditions> {
    // If this is marked as active, deactivate all other versions
    if (terms.active) {
        await TermsAndConditionsModel.updateMany({}, { active: false });
    }
    
    const newTerms = await TermsAndConditionsModel.create(terms);
    return mapDBTerms(newTerms);
}

export async function updateTerms(terms: TermsAndConditions): Promise<TermsAndConditions> {
    // If this is being marked as active, deactivate all other versions
    if (terms.active) {
        await TermsAndConditionsModel.updateMany({ _id: { $ne: terms._id } }, { active: false });
    }
    
    const updatedTerms = await TermsAndConditionsModel.findByIdAndUpdate(terms._id, terms, { new: true });
    if (!updatedTerms) {
        throw new Error('Terms not found');
    }
    return mapDBTerms(updatedTerms);
}

export async function hasUserAcceptedLatestTerms(user_id: string): Promise<boolean> {
    const activeTerms = await getActiveTerms();
    if (!activeTerms || !activeTerms._id) {
        return true; // If no terms exist, consider it accepted
    }

    const acceptance = await UserTermsAcceptanceModel.findOne({
        user_id: new mongoose.Types.ObjectId(user_id),
        terms_id: new mongoose.Types.ObjectId(activeTerms._id)
    });

    return !!acceptance;
}

export async function acceptTerms(user_id: string, ip_address: string, user_agent: string): Promise<UserTermsAcceptance> {
    const activeTerms = await getActiveTerms();
    if (!activeTerms || !activeTerms._id) {
        throw new Error('No active terms found');
    }

    const acceptance = await UserTermsAcceptanceModel.create({
        user_id: new mongoose.Types.ObjectId(user_id),
        terms_id: new mongoose.Types.ObjectId(activeTerms._id),
        version: activeTerms.version,
        ip_address,
        user_agent,
        accepted_at: new Date()
    });

    logger.info(`User ${user_id} accepted terms ${activeTerms._id} version ${activeTerms.version}`);

    return mapDBAcceptance(acceptance);
}

export async function getUserTermsAcceptanceHistory(user_id: string): Promise<UserTermsAcceptance[]> {
    const acceptances = await UserTermsAcceptanceModel.find({ 
        user_id: new mongoose.Types.ObjectId(user_id) 
    }).sort({ accepted_at: -1 });
    
    return acceptances.map(mapDBAcceptance);
}

export async function getAllTermsVersions(): Promise<TermsAndConditions[]> {
    const terms = await TermsAndConditionsModel.find().sort({ created_at: -1 });
    return terms.map(mapDBTerms);
} 