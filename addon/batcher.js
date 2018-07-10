import { join } from '@ember/runloop';

let _running = false;
const _reads = [];
const _writes = [];
const rAF = (typeof window === 'object') && typeof window.requestAnimationFrame === 'function' ? window.requestAnimationFrame : (callback) => setTimeout(callback);

export function scheduleRead(cb) {
  _reads.unshift(cb);
  _run();
}

export function scheduleWrite(cb) {
  _writes.unshift(cb);
  _run();
}

function _run() {
  if (!_running) {
    _running = true;
    rAF(() => {
      join(() => {
        for (let i = 0, rlen = _reads.length; i < rlen; i++) {
          _reads.pop()();
        }
        for (let i = 0, wlen = _writes.length; i < wlen; i++) {
          _writes.pop()();
        }
        _running = false;
        if (_writes.length > 0 || _reads.length > 0) {
          _run();
        }
      });
    });
  }
}
