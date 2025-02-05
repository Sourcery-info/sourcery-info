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