import { join } from '@ember/runloop';
const rAF = (typeof window === 'object') && typeof window.requestAnimationFrame === 'function' ? window.requestAnimationFrame : (callback) => setTimeout(callback);

export default {
  _running: false,
  _reads: [],
  _writes: [],
  scheduleRead(cb) {
    this._reads.unshift(cb);
    this._run();
  },
  scheduleWrite(cb) {
    this._writes.unshift(cb);
    this._run();
  },
  _run() {
    if (!this._running) {
      this._running = true;
      rAF(() => {
        join(() => {
          for (let i = 0, rlen = this._reads.length; i < rlen; i++) {
            this._reads.pop()();
          }
          for (let i = 0, wlen = this._writes.length; i < wlen; i++) {
            this._writes.pop()();
          }
          this._running = false;
          if (this._writes.length > 0 || this._reads.length > 0) {
            this._run();
          }
        });
      });
    }
  }
}