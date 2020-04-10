import { TestWaiter, Token, buildWaiter } from 'ember-test-waiters';

import { DEBUG } from '@glimmer/env';

type MaybeRequestAnimationFrame = (callback: FrameRequestCallback | Function) => number;
type DomOperation = [Token, () => void];

const IS_BROWSER = typeof window === 'object' && typeof document === 'object';
const SCHEDULE_MACROTASK = (callback: Function) => setTimeout(callback);
const readDOMWaiter: TestWaiter = buildWaiter('ember-batcher: readDOM');
const mutateDOMWaiter: TestWaiter = buildWaiter('ember-batcher: mutateDOM');

const reads: Array<DomOperation> = [];
const mutations: Array<DomOperation> = [];
let visibilityChange: Function = () => {};
let running: boolean = false;
let scheduleFnExecuted: boolean = false;

const rafRace = (callback: Function) => {
  let executeCallback = () => {
    if (!scheduleFnExecuted) {
      scheduleFnExecuted = true;
      callback();
    }
  };

  setTimeout(executeCallback, 20);

  return requestAnimationFrame(executeCallback);
};

const scheduleFn: MaybeRequestAnimationFrame =
  typeof window === 'object' && typeof window.requestAnimationFrame === 'function'
    ? rafRace
    : SCHEDULE_MACROTASK;

if (DEBUG && IS_BROWSER) {
  visibilityChange = (
    hidden: boolean = document.hidden,
    hasQueuedWork: Function = () => reads.length > 0 && mutations.length > 0
  ) => {
    return () => {
      if (hidden && hasQueuedWork()) {
        throw new Error(
          "Your browser tab is running in the background. ember-batcher's execution is not guaranteed in this environment"
        );
      }
    };
  };

  document.addEventListener('visibilitychange', visibilityChange());
}

export { visibilityChange };

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
      scheduleFnExecuted = false;

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
export function readDOM(readTask: () => void): void {
  let token = readDOMWaiter.beginAsync();

  reads.unshift([token, readTask]);
  run();
}

/**
 * Provides a mechanism to group DOM mutations to minimize layout thrashing.
 *
 * @param mutationTask The function to call as part of the mutations batch.
 */
export function mutateDOM(mutationTask: () => void): void {
  let token = mutateDOMWaiter.beginAsync();

  mutations.unshift([token, mutationTask]);
  run();
}
