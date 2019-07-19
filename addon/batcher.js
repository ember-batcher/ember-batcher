import { join } from '@ember/runloop';
import { buildWaiter } from 'ember-test-waiters';

const rAF =
  typeof window === 'object' &&
  typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame
    : callback => setTimeout(callback);
const waiter = buildWaiter('ember-batcher waiter');

export default {
  reads: [],
  work: [],
  running: false,
  scheduleRead(callback) {
    this.reads.unshift(callback);
    this.run();
  },
  scheduleWork(callback) {
    this.work.unshift(callback);
    this.run();
  },
  run() {
    if (!this.running) {
      let token = waiter.beginAsync();
      this.running = true;

      rAF(() => {
        join(() => {
          for (let i = 0, rlen = this.reads.length; i < rlen; i++) {
            this.reads.pop()();
          }
          for (let i = 0, wlen = this.work.length; i < wlen; i++) {
            this.work.pop()();
          }
          this.running = false;
          if (this.work.length > 0 || this.reads.length > 0) {
            this.run();
          }

          waiter.endAsync(token);
        });
      });
    }
  },
};
