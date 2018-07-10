import { module, test } from 'ember-qunit';
import {
  scheduleRead,
  scheduleWrite
} from 'ember-batcher/batcher';
import { setupTest } from 'ember-qunit';

module('Unit | Service | Batcher', function(hooks){
  setupTest(hooks);
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
  hooks.beforeEach(function() {
    this.batcher = this.owner.lookup('service:batcher');
  });

  /* setConfiguration, get */

  test('it runs reads before writes', function(assert) {
    assert.expect(2);

    let step = 0;
    
    assert.equal(step++, 0, '0');

    scheduleRead(() => {
      assert.equal(step++, 1, '1');
    });

    scheduleWrite(() => {
      assert.equal(step++, 2, '2');
    });
  });
});
