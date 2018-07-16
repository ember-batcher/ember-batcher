import { module, test } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import batcher from 'ember-batcher/batcher';

module('Unit | Reads/Writes | Batcher', function() {
  test('it inits scheduleRead', function(assert) {
    assert.expect(1);
    assert.ok(typeof batcher.scheduleRead === 'function', 'scheduleRead returns a function');
  });

  test('it inits scheduleWork', function(assert) {
    assert.expect(1);
    assert.ok(typeof batcher.scheduleWork === 'function', 'scheduleWork returns a function');
  });

  test('it runs reads', async function(assert) {
    let step = 0;

    assert.expect(2);

    await batcher.scheduleRead(() => {
      assert.equal(++step, 1, '1');
    });

    await batcher.scheduleRead(() => {
      assert.equal(++step, 2, '2');
    });

    await settled();
  });

  test('it runs writes', async function(assert) {
    let step = 0;
    
    assert.expect(2);

    await batcher.scheduleWork(() => {
      assert.equal(++step, 1, '1');
    });

    await batcher.scheduleWork(() => {
      assert.equal(++step, 2, '2');
    });

    await settled();
  });

  test('it runs reads before writes', async function(assert) {
    let done = assert.async(2);
    let step = 0;

    assert.expect(2);

    await batcher.scheduleWork(() => {
      assert.equal(++step, 2, '2');
      done();
    });

    await batcher.scheduleRead(() => {
      assert.equal(++step, 1, '1');
      done();
    });
  });

  test('it can batch reads and writes', async function(assert) {
    let done = assert.async(5);
    let step = 0;
    let reads = 0;
    let writes = 0;

    assert.expect(10);

    await batcher.scheduleWork(() => {
      assert.equal(++writes, 1, '1');
      assert.equal(++step, 3, '3');
      done();
    });

    await batcher.scheduleRead(() => {
      assert.equal(++reads, 1, '1');
      assert.equal(++step, 1, '1');
      done();
    });

    await batcher.scheduleWork(() => {
      assert.equal(++writes, 2, '2');
      assert.equal(++step, 4, '4');
      done();
    });

    await batcher.scheduleRead(() => {
      assert.equal(++reads, 2, '2');
      assert.equal(++step, 2, '2');
      done();
    });

    await batcher.scheduleWork(() => {
      assert.equal(++writes, 3, '3');
      assert.equal(++step, 5, '5');
      done();
    });
  });
});