/**
 * The minimal structure apps/worker needs at foundation stage: something
 * that can enqueue a job and process it asynchronously off the request
 * path. This is deliberately an in-memory queue, not a real durable queue
 * (BullMQ/SQS/etc.) — that's real infrastructure work for when the
 * creation engine is actually built, not something to fake here.
 */
export interface Job<TPayload = unknown> {
  id: string;
  payload: TPayload;
}

export type JobHandler<TPayload = unknown> = (job: Job<TPayload>) => Promise<void>;

export class InMemoryJobQueue<TPayload = unknown> {
  private readonly queue: Job<TPayload>[] = [];
  private processing = false;

  constructor(private readonly handler: JobHandler<TPayload>) {}

  enqueue(job: Job<TPayload>): void {
    this.queue.push(job);
  }

  get pendingCount(): number {
    return this.queue.length;
  }

  /** Processes every currently-queued job, in order, to completion. */
  async drain(): Promise<void> {
    if (this.processing) throw new Error("drain() called while already draining");
    this.processing = true;
    try {
      while (this.queue.length > 0) {
        const job = this.queue.shift();
        if (!job) continue;
        await this.handler(job);
      }
    } finally {
      this.processing = false;
    }
  }
}
