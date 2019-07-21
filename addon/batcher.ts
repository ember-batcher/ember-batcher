import { join } from '@ember/runloop';
import { buildWaiter, ITestWaiter, Token } from 'ember-test-waiters';

type MaybeRequestAnimationFrame = (callback: FrameRequestCallback | Function) => number;

const SCHEDULE_MACROTASK = (callback: Function) => setTimeout(callback);
const scheduleFn: MaybeRequestAnimationFrame =
  typeof window === 'object' && typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame
    : SCHEDULE_MACROTASK;
const waiter: ITestWaiter = buildWaiter('ember-batcher waiter');

const reads: Array<Function> = [];
const mutations: Array<Function> = [];
let running: boolean = false;

function run(): void {
  if (!running) {
    let token: Token = waiter.beginAsync();
    running = true;

    scheduleFn(() => {
      join(() => {
        let i: number, l: number;

        for (i = 0, l = reads.length; i < l; i++) {
          reads.pop()!();
        }
        for (i = 0, l = mutations.length; i < l; i++) {
          mutations.pop()!();
        }

        running = false;

        if (mutations.length > 0 || reads.length > 0) {
          run();
        }

        waiter.endAsync(token);
      });
    });
  }
}

/**
 * Provides a mechanism to group DOM reads to minimize layout thrashing.
 *
 * @param readTask The function to call as part of the reads batch.
 */
export function readDOM(readTask: Function): void {
  reads.unshift(readTask);
  run();
}

/**
 * Provides a mechanism to group DOM mutations to minimize layout thrashing.
 *
 * @param mutationTask The function to call as part of the mutations batch.
 */
export function mutateDOM(mutationTask: Function): void {
  mutations.unshift(mutationTask);
  run();
}
