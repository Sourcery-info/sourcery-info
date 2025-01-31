/** @type {import('./$types').LayoutServerLoad} */

import { getProject, getProjects } from '$lib/classes/projects';
import { getConversations } from '$lib/classes/conversations';
import { getFiles } from '$lib/classes/files';
import { getEntities } from '$lib/classes/entities';
import { getAlerts } from '$lib/classes/alerts';
import type { Project as ProjectType } from '@sourcery/common/types/Project.type.js';
import type { Conversation as ConversationType } from '@sourcery/common/types/Conversation.type.js';
import type { Entity as EntityType } from '@sourcery/common/types/Entities.type.ts';
import { error, redirect } from '@sveltejs/kit';
import type { SourceryFile } from '$lib/types/SourceryFile.type';
import { ORIGIN } from '$env/static/private';
import type { TAlert } from '@sourcery/common/types/Alert.type';
import type { Session } from '$lib/server/auth';
import type { User } from '@sourcery/common/types/User.type';
import { hasUserAcceptedLatestTerms, getActiveTerms } from '$lib/classes/terms';
import type { TermsAndConditions } from '@sourcery/common/types/TermsAndConditions.type';

type response = {
    project: ProjectType | null,
    projects: ProjectType[] | null,
    conversations: ConversationType[] | null,
    entities: EntityType[] | null,
    alerts: TAlert[] | null,
    token: string | null,
    origin: string;
    user: User | null;
    session: Session | null;
    terms: {
        needsAcceptance: boolean;
        activeTerms: TermsAndConditions | null;
    };
}

export async function load({ params, locals, cookies }): Promise<response> {
    if (!locals?.session?.user_id) {
        return error(401, 'Unauthorized');
    }
    const projects = await getProjects(locals?.session?.user_id);
    const token = cookies.get("session") ?? null;
    let response: response = {
        project: null,
        projects: projects,
        conversations: [],
        entities: [],
        alerts: [],
        token: token,
        origin: ORIGIN,
        user: locals?.user,
        session: locals?.session,
        terms: {
            needsAcceptance: false,
            activeTerms: null
        }
    }
    if (params?.project_id) {
        response.project = await getProject(params.project_id);
        if (response.project) {
            const files = await getFiles(params.project_id);
            response.project.files = files as unknown as SourceryFile[];
            response.conversations = (await getConversations(params.project_id)).map(conversation => {
                delete conversation.messages;
                return conversation;
            });
            response.entities = await getEntities(params.project_id);
            response.alerts = await getAlerts(locals.session.user_id);
        }
    }

    const user = locals.user;
    if (user) {
        // Check if user has accepted the latest terms
        const hasAcceptedTerms = await hasUserAcceptedLatestTerms(user.user_id);
        const activeTerms = await getActiveTerms();

        response.terms = {
            needsAcceptance: !hasAcceptedTerms && activeTerms !== null,
            activeTerms: activeTerms
        };
    }

    return response;
};
