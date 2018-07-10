import { join } from '@ember/runloop';
const rAF = (typeof window === 'object') && typeof window.requestAnimationFrame === 'function' ? window.requestAnimationFrame : (callback) => setTimeout(callback);

export default {
  reads: [],
  writes: [],
  running: false,
  scheduleRead(callback) {
    this.reads.unshift(callback);
    this.run();
  },
  scheduleWrite(callback) {
    this.writes.unshift(callback)
    this.run();
  },
  run() {
    if (!this.running) {
      this.running = true;
      rAF(() => {
        join(() => {
          for (let i = 0, rlen = this.reads.length; i < rlen; i++) {
            this.reads.pop()();
          }
          for (let i = 0, wlen = this.writes.length; i < wlen; i++) {
            this.writes.pop()();
          }
          this.running = false;
          if (this.writes.length > 0 || this.reads.length > 0) {
            this.run();
          }
        });
      });
    }
  }
};