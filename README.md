# ember-batcher

[![Build Status](https://travis-ci.org/lynchbomb/ember-batcher.svg?branch=master)](https://travis-ci.org/lynchbomb/ember-batcher) [![npm version](https://d25lcipzij17d.cloudfront.net/badge.svg?id=js&type=6&v=1.0.0&x2=0)](https://www.npmjs.com/package/ember-batcher)

Ember addon to batch reads and writes using `requestAnimationFrame` and [Backburner#join](https://github.com/BackburnerJS/backburner.js/blob/3e4b3561acddd9d8cbbef9a751ba778b4acb1fbf/lib/index.ts#L322-L343) [(Ember's Run Loop)](https://guides.emberjs.com/release/applications/run-loop/).

## Compatibility

- Ember.js v3.4 or above
- Ember CLI v2.13 or above
- Node.js v8 or above

## Installation

```
ember install ember-batcher
```

## Usage

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

#### `scheduleWork(callback)`

Register a callback method that will get batched with other "work" and before other "reads". The method will be called on the next `requestAnimationFrame`. The method will be executed within either the current run loop or will create a new run loop if necessary.

```JavaScript
import Component from '@ember/component';
import {
  scheduleWork
} from 'ember-batcher/batcher';

export default Component.extend({
  foo() {
    scheduleWork(() => {
      // write work
    });
  }
});
```

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
