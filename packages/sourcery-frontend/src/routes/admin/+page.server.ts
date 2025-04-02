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
import { ProjectModel } from '@sourcery/common/src/models/Project.model';
import { UserModel } from '@sourcery/common/src/models/User.model';
import { ConversationModel } from '@sourcery/common/src/models/Conversation.model';
import { EntityModel } from '@sourcery/common/src/models/Entity.model';
import { ChunkModel } from '@sourcery/common/src/models/Chunk.model';
import { FileModel } from '@sourcery/common/src/models/File.model';
import type { Model } from 'mongoose';

type BucketSize = 'day' | 'week' | 'month';

interface TimeSeriesAggregation {
    _id: {
        year: number;
        month?: number;
        week?: number;
        day?: number;
    };
    count: number;
    firstDate: Date;
}

interface TimeRange {
    start: Date;
    end: Date;
}

interface GroupStage {
    _id: {
        year: { $year: string };
        month?: { $month: string };
        week?: { $week: string };
        day?: { $dayOfMonth: string };
    };
    count: { $sum: number };
    firstDate: { $min: string };
}

async function getTimeSeriesStats(
    Model: Model<any>,
    timeRange: TimeRange,
    bucketSize: BucketSize
): Promise<Array<{ date: Date; count: number }>> {
    const groupStage: GroupStage = {
        _id: {
            year: { $year: '$created_at' }
        },
        count: { $sum: 1 },
        firstDate: { $min: '$created_at' }
    };

    // Add appropriate time unit to group stage
    switch (bucketSize) {
        case 'month':
            groupStage._id.month = { $month: '$created_at' };
            break;
        case 'week':
            groupStage._id.week = { $week: '$created_at' };
            break;
        case 'day':
            groupStage._id.month = { $month: '$created_at' };
            groupStage._id.day = { $dayOfMonth: '$created_at' };
            break;
    }

    const stats = await Model.aggregate<TimeSeriesAggregation>([
        {
            $match: {
                created_at: { 
                    $gte: timeRange.start,
                    $lte: timeRange.end
                }
            }
        },
        {
            $group: groupStage
        },
        {
            $sort: { 
                '_id.year': 1,
                ...bucketSize === 'month' ? { '_id.month': 1 } :
                   bucketSize === 'week' ? { '_id.week': 1 } :
                   { '_id.month': 1, '_id.day': 1 }
            }
        }
    ]);

    return stats.map(item => ({
        date: item.firstDate,
        count: item.count
    }));
}

export const load: PageServerLoad = async ({ locals, url }) => {
    if (!locals.user?.admin) {
        throw error(403, 'Unauthorized');
    }

    try {
        // Parse query parameters
        const bucketSize = (url.searchParams.get('bucket') as BucketSize) || 'week';
        const startDate = url.searchParams.get('start') ? 
            new Date(url.searchParams.get('start')!) : 
            new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // Default to 90 days ago
        const endDate = url.searchParams.get('end') ?
            new Date(url.searchParams.get('end')!) :
            new Date();

        const timeRange = { start: startDate, end: endDate };
        const now = new Date();
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Fetch all stats in parallel
        const [
            projectStats,
            userStats,
            conversationStats,
            entityCount,
            chunkCount,
            fileCount,
            userTimeSeries,
            entityTimeSeries,
            chunkTimeSeries,
            fileTimeSeries,
            projectTimeSeries
        ] = await Promise.all([
            // Current stats
            Promise.all([
                ProjectModel.countDocuments(),
                ProjectModel.countDocuments({ updated_at: { $gte: lastWeek } })
            ]),
            Promise.all([
                UserModel.countDocuments(),
                UserModel.countDocuments({ updated_at: { $gte: lastWeek } })
            ]),
            Promise.all([
                ConversationModel.countDocuments(),
                ConversationModel.countDocuments({ created_at: { $gte: lastWeek } })
            ]),
            EntityModel.countDocuments(),
            ChunkModel.countDocuments(),
            FileModel.countDocuments(),
            // Time series data
            getTimeSeriesStats(UserModel, timeRange, bucketSize),
            getTimeSeriesStats(EntityModel, timeRange, bucketSize),
            getTimeSeriesStats(ChunkModel, timeRange, bucketSize),
            getTimeSeriesStats(FileModel, timeRange, bucketSize),
            getTimeSeriesStats(ProjectModel, timeRange, bucketSize)
        ]);

        return {
            timeRange,
            bucketSize,
            stats: {
                projects: {
                    total: projectStats[0],
                    active: projectStats[1]
                },
                users: {
                    total: userStats[0],
                    active: userStats[1]
                },
                conversations: {
                    total: conversationStats[0],
                    lastWeek: conversationStats[1]
                },
                entities: {
                    total: entityCount
                },
                chunks: {
                    total: chunkCount
                },
                files: {
                    total: fileCount
                }
            },
            timeSeries: {
                projects: projectTimeSeries,
                users: userTimeSeries,
                entities: entityTimeSeries,
                chunks: chunkTimeSeries,
                files: fileTimeSeries
            }
        };
    } catch (err) {
        console.error('Error fetching admin stats:', err);
        throw error(500, 'Error fetching admin stats');
    }
};