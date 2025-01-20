import { type Mock, describe, expect, it, vi } from 'vitest';
import type { ProcessedFile } from '../../../src/core/file/fileTypes.js';
import { calculateAllFileMetrics } from '../../../src/core/metrics/calculateAllFileMetrics.js';
import { calculateMetrics } from '../../../src/core/metrics/calculateMetrics.js';
import { TokenCounter } from '../../../src/core/tokenCount/tokenCount.js';
import type { RepomixProgressCallback } from '../../../src/shared/types.js';
import { createMockConfig } from '../../testing/testUtils.js';

vi.mock('../../../src/core/tokenCount/tokenCount.js');
vi.mock('../../../src/core/metrics/aggregateMetrics.js');
vi.mock('../../../src/core/metrics/calculateAllFileMetrics.js');

describe('calculateMetrics', () => {
  it('should calculate metrics and return the result', async () => {
    const processedFiles: ProcessedFile[] = [
      { path: 'file1.txt', content: 'a'.repeat(100) },
      { path: 'file2.txt', content: 'b'.repeat(200) },
    ];
    const output = 'a'.repeat(300);
    const progressCallback: RepomixProgressCallback = vi.fn();

    const mockTokenCounter = {
      countTokens: vi.fn(),
      free: vi.fn(),
    };
    (TokenCounter as unknown as Mock).mockImplementation(() => mockTokenCounter);

    const fileMetrics = [
      { path: 'file1.txt', charCount: 100, tokenCount: 10 },
      { path: 'file2.txt', charCount: 200, tokenCount: 20 },
    ];
    (calculateAllFileMetrics as unknown as Mock).mockResolvedValue(fileMetrics);

    const aggregatedResult = {
      totalFiles: 2,
      totalCharacters: 300,
      totalTokens: 30,
      fileCharCounts: {
        'file1.txt': 100,
        'file2.txt': 200,
      },
      fileTokenCounts: {
        'file1.txt': 10,
        'file2.txt': 20,
      },
    };

    const config = createMockConfig();

    const result = await calculateMetrics(processedFiles, output, progressCallback, config);

    expect(progressCallback).toHaveBeenCalledWith('Calculating metrics...');
    expect(calculateAllFileMetrics).toHaveBeenCalledWith(processedFiles, mockTokenCounter, progressCallback);
    expect(mockTokenCounter.free).toHaveBeenCalled();
    expect(result).toEqual(aggregatedResult);
  });
});
