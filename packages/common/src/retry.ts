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

import { logger } from './logger';
import { setTimeout } from 'timers/promises';

export type RetryOptions = {
    maxRetries?: number;
    identifier?: string;
    delayMs?: number;
};

export async function retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const { maxRetries = 3, identifier = 'operation', delayMs = 500 } = options;
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (attempt < maxRetries) {
                logger.warn({
                    msg: `Attempt ${attempt} failed for ${identifier}, retrying after ${delayMs}ms...`,
                    error: lastError.message,
                    attempt,
                    maxRetries,
                    delayMs,
                    tags: ['retry', 'warning']
                });
                await setTimeout(delayMs);
            }
        }
    }
    
    // If we get here, all retries failed
    logger.error({
        msg: `All ${maxRetries} retry attempts failed for ${identifier}`,
        error: lastError?.message,
        maxRetries,
        tags: ['retry', 'error']
    });
    
    throw lastError;
} 