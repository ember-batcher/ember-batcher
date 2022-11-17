# ember-batcher

![CI Build](https://github.com/ember-batcher/ember-batcher/workflows/CI%20Build/badge.svg)
[![Ember Observer Score](https://emberobserver.com/badges/ember-batcher.svg)](https://emberobserver.com/addons/ember-batcher)
[![npm version](https://badge.fury.io/js/ember-batcher.svg)](https://badge.fury.io/js/ember-batcher)
[![Monthly Downloads from NPM](https://img.shields.io/npm/dm/ember-batcher.svg?style=flat-square)](https://www.npmjs.com/package/ember-batcher)
[![Code Style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](#badge)

An Ember addon to batch DOM reads and mutations using `requestAnimationFrame`.

As noted in Paul Irish's "[What Forces Layout](https://gist.github.com/paulirish/5d52fb081b3570c81e3a)", a number of properties or methods, when requested/called, will trigger the browser to sychronously calculate the style and layout. This is also called reflow or layout thrashing, and is common performance bottleneck. This addon attempts to provide a mechanism to compliment Ember's runloop batching to help minimize layout thrashing.

## Compatibility

* Ember.js v3.24 or above
* Ember CLI v3.24 or above
* Node.js v14 or above

## Installation

```bash
ember install ember-batcher
```

## Usage

### `readDOM(readTask: Function): void`

Register a task function that will get batched with other "reads" and called on the next `requestAnimationFrame` (if supported). The method will be executed within either the current run loop or will create a new run loop if necessary.

```js
import Component from '@glimmer/component';
import { readDOM } from 'ember-batcher';

export default class MyComponent extends Component {
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
import Component from '@glimmer/component';
import { mutateDOM } from 'ember-batcher';

export default class MyComponent extends Component {
  foo() {
    mutateDOM(() => {
      // Perform DOM mutation
    });
  },
}
```

### Reads, then Writes

Since the purpose of this addon is to minimize layout thrashing, we want to perform _all_ _reads_ before we perform _writes_. Additionally, you should close over values created during the _read_ phase that are used in the _write_ phase. This helps ensure that work doesn't leak outside of the frame we're performing the work in, and allows you to prepare values in the _read_ phase that are used in the subsequent _write_ phase.

To be clear, _writes_ should not occur during the _reads_ phase, therefore you should not have any code that performs any reads from within the callback of `readDOM`. All _writes_ should occur inside a call to `mutateDOM`, whether that's in a non-nested call to `_mutateDOM` itself, or from a `nested` call to `mutateDOM` inside of a `readDOM` call.

Example of _read_ first, then _write_.

```js
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { readDOM, mutateDOM } from 'ember-batcher';

export default class MyComponent extends Component {
  @tracked
  width;

  foo() {
    readDOM(() => {
      const width = document.querySelector('.foo').clientWidth;

      mutateDOM(() => {
        // we should perform our update conditionally, only if the value of width changes. This helps
        // minimize unnecessary layout thrashing.
        if (this.width !== width) {
          this.width = width * 2;
        }
      });
    });
  },
}
```

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
