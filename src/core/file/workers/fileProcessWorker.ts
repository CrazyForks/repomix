import type { RepomixConfigMerged } from '../../../config/configSchema.js';
import { logger } from '../../../shared/logger.js';
import { getFileManipulator } from '../fileManipulate.js';
import type { ProcessedFile, RawFile } from '../fileTypes.js';

interface FileProcessWorkerInput {
  rawFile: RawFile;
  index: number;
  totalFiles: number;
  config: RepomixConfigMerged;
}

/**
 * Worker thread function that processes a single file
 */
export default async ({ rawFile, index, totalFiles, config }: FileProcessWorkerInput): Promise<ProcessedFile> => {
  const processStartAt = process.hrtime.bigint();
  let processedContent = rawFile.content;
  const manipulator = getFileManipulator(rawFile.path);

  logger.trace(`Processing file: ${rawFile.path}`);

  if (manipulator && config.output.removeComments) {
    processedContent = manipulator.removeComments(processedContent);
  }

  return {
    path: rawFile.path,
    content: processedContent,
  };
};
