# ember-batcher [![Build Status](https://travis-ci.org/lynchbomb/ember-batcher.svg?branch=master)](https://travis-ci.org/lynchbomb/ember-batcher) [![npm version](https://badge.fury.io/js/ember-batcher.svg)](https://www.npmjs.com/package/ember-batcher)

Ember addon to batch reads and writes within `requestAnimationFrame` and [Backburner#join](https://github.com/BackburnerJS/backburner.js/blob/3e4b3561acddd9d8cbbef9a751ba778b4acb1fbf/lib/index.ts#L322-L343) [(Ember's Run Loop)](https://guides.emberjs.com/release/applications/run-loop/).

#### `scheduleRead(callback)`

Register a callback method that will get batched with other "reads" and called on the next `requestAnimationFrame`. The method will be executed within either the current run loop or will create a new run loop if necessary.

```JavaScript
import Component from '@ember/component';
import {
  scheduleRead
} from 'ember-batcher/batcher';

export default Component.extend({
  foo() {
    scheduleRead(() => {
      // read work
    });
  }
});
```

#### `scheduleWrite(callback)`

Register a callback method that will get batched with other "writes" and before other "reads". The method will be called on the next `requestAnimationFrame`. The method will be executed within either the current run loop or will create a new run loop if necessary.

```JavaScript
import Component from '@ember/component';
import {
  scheduleWrite
} from 'ember-batcher/batcher';

export default Component.extend({
  foo() {
    scheduleWrite(() => {
      // write work
    });
  }
});
```

## Requirements

Ember `2.x.x` is required. Tests are only run against [latest LTS and latest release](http://emberjs.com/builds/).

## Installation

* `git clone https://github.com/lynchbomb/ember-batcher.git` this repository
* `cd ember-batcher`
* `yarn`

### Linting

* `npm run lint:js`
* `npm run lint:js -- --fix`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `yarn test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"

## Building

* `ember build`

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).
