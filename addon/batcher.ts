import { buildWaiter, ITestWaiter, Token } from 'ember-test-waiters';

type MaybeRequestAnimationFrame = (callback: FrameRequestCallback | Function) => number;

const SCHEDULE_MACROTASK = (callback: Function) => setTimeout(callback);
const scheduleFn: MaybeRequestAnimationFrame =
  typeof window === 'object' && typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame
    : SCHEDULE_MACROTASK;
const readDOMWaiter: ITestWaiter = buildWaiter('ember-batcher readDOM waiter');
const mutateDOMWaiter: ITestWaiter = buildWaiter('ember-batcher mutateDOM waiter');

const reads: Array<[Token, Function]> = [];
const mutations: Array<[Token, Function]> = [];
let running: boolean = false;

function run(): void {
  if (!running) {
    running = true;

    scheduleFn(() => {
      let i: number, l: number;

      for (i = 0, l = reads.length; i < l; i++) {
        let [token, readTask] = reads.pop()!;
        readTask();
        readDOMWaiter.endAsync(token);
      }
      for (i = 0, l = mutations.length; i < l; i++) {
        let [token, mutateTask] = mutations.pop()!;
        mutateTask();
        mutateDOMWaiter.endAsync(token);
      }

      running = false;

      if (mutations.length > 0 || reads.length > 0) {
        run();
      }
    });
  }
}

/**
 * Provides a mechanism to group DOM reads to minimize layout thrashing.
 *
 * @param readTask The function to call as part of the reads batch.
 */
export function readDOM(readTask: Function): void {
  let token = readDOMWaiter.beginAsync();

  reads.unshift([token, readTask]);
  run();
}

/**
 * Provides a mechanism to group DOM mutations to minimize layout thrashing.
 *
 * @param mutationTask The function to call as part of the mutations batch.
 */
export function mutateDOM(mutationTask: Function): void {
  let token = mutateDOMWaiter.beginAsync();

  mutations.unshift([token, mutationTask]);
  run();
}
