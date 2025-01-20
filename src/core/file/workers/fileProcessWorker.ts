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

  if (config.output.removeComments && manipulator) {
    processedContent = manipulator.removeComments(processedContent);
  }

  if (config.output.removeEmptyLines && manipulator) {
    processedContent = manipulator.removeEmptyLines(processedContent);
  }

  processedContent = processedContent.trim();

  if (config.output.showLineNumbers) {
    const lines = processedContent.split('\n');
    const padding = lines.length.toString().length;
    const numberedLines = lines.map((line, i) => `${(i + 1).toString().padStart(padding)}: ${line}`);
    processedContent = numberedLines.join('\n');
  }

  const processEndAt = process.hrtime.bigint();
  logger.trace(`Processed file: ${rawFile.path}. Took: ${(Number(processEndAt - processStartAt) / 1e6).toFixed(2)}ms`);

  return {
    path: rawFile.path,
    content: processedContent,
  };
};
