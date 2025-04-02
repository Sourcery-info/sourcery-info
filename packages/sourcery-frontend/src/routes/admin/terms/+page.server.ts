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

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { TermsAndConditionsModel } from '@sourcery/common/src/models/TermsAndConditions.model';

export const load: PageServerLoad = async () => {
    try {
        const terms = await TermsAndConditionsModel.find()
            .sort({ created_at: -1 })
            .lean();

        return {
            terms: terms.map(term => ({
                _id: term._id.toString(),
                version: term.version,
                content: term.content,
                active: term.active,
                created_at: term.created_at,
                updated_at: term.updated_at
            }))
        };
    } catch (err) {
        console.error('Error loading terms:', err);
        throw error(500, 'Error loading Terms & Conditions');
    }
}; 