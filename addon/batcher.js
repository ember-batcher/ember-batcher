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
        for (let i = 0, rlen = reads.length; i < rlen; i++) {
          reads.pop()();
        }
        for (let i = 0, wlen = work.length; i < wlen; i++) {
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
