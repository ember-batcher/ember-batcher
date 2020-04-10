import { module, test } from 'ember-qunit';
import { settled } from '@ember/test-helpers';
import { readDOM, mutateDOM } from 'ember-batcher';
import { visibilityChange } from 'ember-batcher/batcher';
import { getPendingWaiterState, TestWaiterDebugInfo } from 'ember-test-waiters';

module('Unit | Batcher', function() {
  test('it errors on background tabs', function(assert: Assert) {
    assert.throws(() => {
      visibilityChange(true, () => true)();
    });
  });

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

    assert.equal(getPendingWaiterState().pending, 0, 'precond - no pending waiters before readDOM');

    readDOM(foo);

    let pendingWaiters = getPendingWaiterState();

    assert.equal(pendingWaiters.pending, 1);
    assert.ok(
      (<TestWaiterDebugInfo[]>pendingWaiters.waiters['ember-batcher: readDOM'])[0].stack!.indexOf(
        'readDOM'
      ) > -1
    );

    await settled();
  });

  test('waiter is correctly wired up for mutateDOM', async function(assert: Assert) {
    function foo() {}

    assert.equal(
      getPendingWaiterState().pending,
      0,
      'precond - no pending waiters before mutateDOM'
    );

    mutateDOM(foo);

    let pendingWaiters = getPendingWaiterState();

    assert.equal(pendingWaiters.pending, 1);
    assert.ok(
      (<TestWaiterDebugInfo[]>pendingWaiters.waiters['ember-batcher: mutateDOM'])[0].stack!.indexOf(
        'mutateDOM'
      ) > -1
    );

    await settled();
  });
});
