import { module, test } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import { scheduleRead, scheduleWork } from 'ember-batcher';

module('Unit | Reads/Writes | Batcher', function() {
  test('it runs reads', async function(assert) {
    assert.expect(3);

    scheduleRead(() => {
      assert.step('First read');
    });

    scheduleRead(() => {
      assert.step('Second read');
    });

    await settled();

    assert.verifySteps(['First read', 'Second read']);
  });

  test('it runs writes', async function(assert) {
    assert.expect(3);

    scheduleWork(() => {
      assert.step('First work');
    });

    scheduleWork(() => {
      assert.step('Second work');
    });

    await settled();

    assert.verifySteps(['First work', 'Second work']);
  });

  test('it runs reads before writes', async function(assert) {
    assert.expect(3);

    scheduleWork(() => {
      assert.step('Second work');
    });

    scheduleRead(() => {
      assert.step('First read');
    });

    await settled();

    assert.verifySteps(['First read', 'Second work']);
  });

  test('it can batch reads and writes', async function(assert) {
    assert.expect(6);

    scheduleWork(() => {
      assert.step('First write');
    });

    scheduleRead(() => {
      assert.step('First read');
    });

    scheduleWork(() => {
      assert.step('Second write');
    });

    scheduleRead(() => {
      assert.step('Second read');
    });

    scheduleWork(() => {
      assert.step('Third write');
    });

    await settled();

    assert.verifySteps([
      'First read',
      'Second read',
      'First write',
      'Second write',
      'Third write',
    ]);
  });
});
