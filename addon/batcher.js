import { join } from '@ember/runloop';
import { buildWaiter } from 'ember-test-waiters';

const rAF =
  typeof window === 'object' &&
  typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame
    : callback => setTimeout(callback);
const waiter = buildWaiter('ember-batcher waiter');

const reads = [];
const work = [];
let running = false;

function run() {
  if (!running) {
    let token = waiter.beginAsync();
    running = true;

    rAF(() => {
      join(() => {
        let i, l;

        for (i = 0, l = reads.length; i < l; i++) {
          reads.pop()();
        }
        for (i = 0, l = work.length; i < l; i++) {
          work.pop()();
        }

        running = false;

        if (work.length > 0 || reads.length > 0) {
          run();
        }

        waiter.endAsync(token);
      });
    });
  }
}

export function scheduleRead(callback) {
  reads.unshift(callback);
  run();
}
export function scheduleWork(callback) {
  work.unshift(callback);
  run();
}
