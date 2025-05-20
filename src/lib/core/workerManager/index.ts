import { WorkerWrapper } from './domain/workerWrapper';

export class WorkerManager {
  private workers: WorkerWrapper[] = [];
  private workerScriptUrl: URL;

  constructor(poolSize: number = navigator.hardwareConcurrency || 4) {
    this.workerScriptUrl = new URL('./worker.js', import.meta.url);
    this.workers = Array.from(
      { length: poolSize }, () => new WorkerWrapper(this.workerScriptUrl),
    );
  }

  getLeastBusyWorker(): WorkerWrapper {
    return this.workers.reduce((prev, current) =>
      prev.busyness < current.busyness ? prev : current,
    );
  }
}
