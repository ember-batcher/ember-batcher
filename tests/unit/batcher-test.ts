import { module, test } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import { readDOM, mutateDOM } from 'ember-batcher';
import { getPendingWaiterState, ITestWaiterDebugInfo } from 'ember-test-waiters';
import { assert } from '@ember/debug';

module('Unit | Batcher', function() {
  test('it runs reads', async function(assert: Assert) {
    assert.expect(3);

    readDOM(() => {
      assert.step('First read');
    });

    readDOM(() => {
      assert.step('Second read');
    });

    await settled();

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

    await settled();

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

    await settled();

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

    await settled();

    assert.verifySteps(['First read', 'Second read', 'First write', 'Second write', 'Third write']);
  });

  test('waiter is correctly wired up for readDOM', async function(assert: Assert) {
    function foo() {}

    readDOM(foo);

    let pendingWaiters = getPendingWaiterState();

    assert.equal(pendingWaiters.pending, 2);
    assert.ok((<ITestWaiterDebugInfo[]>pendingWaiters.waiters['ember-batcher readDOM waiter'])[0].stack!.indexOf('readDOM') > -1);

    await settled();
  });

  test('waiter is correctly wired up for mutateDOM', async function(assert: Assert) {
    function foo() {}

    mutateDOM(foo);

    let pendingWaiters = getPendingWaiterState();

    assert.equal(pendingWaiters.pending, 2);
    assert.ok((<ITestWaiterDebugInfo[]>pendingWaiters.waiters['ember-batcher mutateDOM waiter'])[0].stack!.indexOf('mutateDOM') > -1);

    await settled();
  });
});
