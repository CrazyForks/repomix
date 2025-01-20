// src/core/metrics/workers/tokenCountWorker.ts

import type { TiktokenEncoding } from 'tiktoken';
import { logger } from '../../../shared/logger.js';
import { TokenCounter } from '../../tokenCount/tokenCount.js';

interface TokenCountWorkerInput {
  content: string;
  encoding: TiktokenEncoding;
  path?: string;
}

// Worker-level singleton for TokenCounter
let tokenCounter: TokenCounter | null = null;

/**
 * Get or create TokenCounter instance
 */
const getTokenCounter = (encoding: TiktokenEncoding): TokenCounter => {
  if (!tokenCounter) {
    tokenCounter = new TokenCounter(encoding);
  }
  return tokenCounter;
};

/**
 * Worker thread function that counts tokens for content
 */
export default async ({ content, encoding, path }: TokenCountWorkerInput): Promise<number> => {
  const processStartAt = process.hrtime.bigint();
  const counter = getTokenCounter(encoding);
  const tokenCount = counter.countTokens(content, path);

  const processEndAt = process.hrtime.bigint();
  if (path) {
    logger.trace(
      `Counted tokens for ${path}. Count: ${tokenCount}. Took: ${(Number(processEndAt - processStartAt) / 1e6).toFixed(2)}ms`
    );
  }

  return tokenCount;
};

// Cleanup when worker is terminated
process.on('exit', () => {
  if (tokenCounter) {
    tokenCounter.free();
    tokenCounter = null;
  }
});
