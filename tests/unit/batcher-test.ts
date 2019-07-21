import { module, test } from 'ember-qunit';
import { domBatchingSettled } from 'ember-batcher/test-support';
import { readDOM, mutateDOM } from 'ember-batcher';

module('Unit | Batcher', function() {
  test('it runs reads', async function(assert: Assert) {
    assert.expect(3);

    readDOM(() => {
      assert.step('First read');
    });

    readDOM(() => {
      assert.step('Second read');
    });

    await domBatchingSettled();

    assert.verifySteps(['First read', 'Second read']);
  });

  test('it runs writes', async function(assert: Assert) {
    assert.expect(3);

    mutateDOM(() => {
      assert.step('First work');
    });

    mutateDOM(() => {
      assert.step('Second work');
    });

    await domBatchingSettled();

    assert.verifySteps(['First work', 'Second work']);
  });

  test('it runs reads before writes', async function(assert: Assert) {
    assert.expect(3);

    mutateDOM(() => {
      assert.step('Second work');
    });

    readDOM(() => {
      assert.step('First read');
    });

    await domBatchingSettled();

    assert.verifySteps(['First read', 'Second work']);
  });

  test('it can batch reads and writes', async function(assert: Assert) {
    assert.expect(6);

    mutateDOM(() => {
      assert.step('First write');
    });

    readDOM(() => {
      assert.step('First read');
    });

    mutateDOM(() => {
      assert.step('Second write');
    });

    readDOM(() => {
      assert.step('Second read');
    });

    mutateDOM(() => {
      assert.step('Third write');
    });

    await domBatchingSettled();

    assert.verifySteps(['First read', 'Second read', 'First write', 'Second write', 'Third write']);
  });
});
