/**
 * Task definition for file reading worker
 */
export interface ReadFileTask {
  filePath: string;
  rootDir: string;
}

/**
 * Configuration for worker thread pool
 */
export interface WorkerPoolConfig {
  minThreads?: number;
  maxThreads?: number;
  idleTimeout?: number;
}
