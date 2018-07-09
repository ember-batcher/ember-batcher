import { moduleFor, test } from 'ember-qunit';
import sinon from 'sinon';

moduleFor('service:batcher', 'Unit | Service | Batcher', {
  // Specify the other units that are required for this test.
  needs: ['service:batcher']
});

test('it inits service ok', function(assert) {
  let batcher = this.subject();
  assert.ok(batcher);
});

test('it runs reads before writes', function(assert, done) {
  let batcher = this.subject();

  let read = sinon.spy(function() {
    assert(!write.called);
  });

  let write = sinon.spy(function() {
    assert(read.called);
    done();
  });

  batcher.scheduleRead(read);
  batcher.scheduleWrite(write);
});


test('it batches reads/writes in-order', function(assert, done) {
  let batcher = this.subject();
  let rAF = window.requestAnimationFrame;

  let r1 = sinon.spy();
  let r2 = sinon.spy();
  let w1 = sinon.spy();
  let w2 = sinon.spy();

  batcher.scheduleRead(r1);
  batcher.scheduleWrite(w1);
  batcher.scheduleRead(r2);
  batcher.scheduleWrite(w2);

  rAF(() => {
    assert(r1.calledBefore(r2));
    assert(r2.calledBefore(w1));
    assert(w1.calledBefore(w2));
    done();
  });
});