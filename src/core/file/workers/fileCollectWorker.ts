import * as fs from 'node:fs/promises';
import path from 'node:path';
import iconv from 'iconv-lite';
import { isBinary } from 'istextorbinary';
import jschardet from 'jschardet';
import { logger } from '../../../shared/logger.js';
import type { ReadFileTask } from './types.js';

/**
 * Reads a file and detects if it's binary or text
 * Returns null if file is binary or unreadable
 */
const readRawFile = async (filePath: string): Promise<string | null> => {
  if (isBinary(filePath)) {
    logger.debug(`Skipping binary file: ${filePath}`);
    return null;
  }

  logger.trace(`Reading file: ${filePath}`);

  try {
    const buffer = await fs.readFile(filePath);

    if (isBinary(null, buffer)) {
      logger.debug(`Skipping binary file (content check): ${filePath}`);
      return null;
    }

    const encoding = jschardet.detect(buffer).encoding || 'utf-8';
    const content = iconv.decode(buffer, encoding);

    return content;
  } catch (error) {
    logger.warn(`Failed to read file: ${filePath}`, error);
    return null;
  }
};

/**
 * Worker thread function that reads a single file
 */
export default async ({ filePath, rootDir }: ReadFileTask) => {
  const fullPath = path.resolve(rootDir, filePath);
  const content = await readRawFile(fullPath);

  if (content) {
    return {
      path: filePath,
      content,
    };
  }

  return null;
};
