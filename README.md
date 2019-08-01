# ember-batcher

[![Build Status](https://travis-ci.com/ember-batcher/ember-batcher.svg?branch=master)](https://travis-ci.com/ember-batcher/ember-batcher) [![npm version](https://badge.fury.io/js/ember-batcher.svg)](https://badge.fury.io/js/ember-batcher)

An Ember addon to batch DOM reads and mutations using `requestAnimationFrame`.

As noted in Paul Irish's "[What Forces Layout](https://gist.github.com/paulirish/5d52fb081b3570c81e3a)", a number of properties or methods, when requested/called, will trigger the browser to sychronously calculate the style and layout. This is also called reflow or layout thrashing, and is common performance bottleneck. This addon attempts to provide a mechanism to compliment Ember's runloop batching to help minimize layout thrashing.

## Compatibility

- Ember.js v3.4 or above
- Ember CLI v2.13 or above
- Node.js v8 or above

## Installation

```bash
ember install ember-batcher
```

## Usage

### `readDOM(readTask: Function): void`

Register a task function that will get batched with other "reads" and called on the next `requestAnimationFrame` (if supported). The method will be executed within either the current run loop or will create a new run loop if necessary.

```js
import Component from '@ember/component';
import { readDOM } from 'ember-batcher';

export default MyComponent extends Component {
  foo() {
    readDOM(() => {
      // Perform DOM read
    });
  }
}
```

### `mutateDOM(mutationTask: Function): void`

Register a task function that will get batched with other "mutations" and before other "reads". The method will be called on the next `requestAnimationFrame` (if supported). The method will be executed within either the current run loop or will create a new run loop if necessary.

```js
import Component from '@ember/component';
import { mutateDOM } from 'ember-batcher';

export default MyComponent extends Component {
  foo() {
    mutateDOM(() => {
      // Perform DOM mutation
    });
  },
}
```

### Reads, then Writes

Since the purpose of this addon is to minimize layout thrashing, we want to perform _all_ *reads* before we perform *writes*. Additionally, we want to encourage closing over values created during the *read* phase that are used in the *write* phase. This helps ensure that work doesn't leak outside of the frame we're performing the work in. 

Example of *read* first, then *write*.

```js
import Component from '@ember/component';
import { readDOM, mutateDOM } from 'ember-batcher';

export default MyComponent extends Component {
  foo() {
    readDOM(() => {
      const width = element.clientWidth;
      
      mutateDOM(() => {
        this.set('width', width * 2);
      });
    });
  },
}
```

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
