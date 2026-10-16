# deferable

[![npm](https://img.shields.io/npm/v/deferable.svg)](https://www.npmjs.com/package/deferable)
[![CI](https://github.com/webduvet/deferable/actions/workflows/ci.yml/badge.svg)](https://github.com/webduvet/deferable/actions/workflows/ci.yml)
[![Weekly health check](https://github.com/webduvet/deferable/actions/workflows/weekly.yml/badge.svg)](https://github.com/webduvet/deferable/actions/workflows/weekly.yml)
[![types](https://img.shields.io/npm/types/deferable.svg)](https://www.npmjs.com/package/deferable)
[![install size](https://packagephobia.com/badge?p=deferable)](https://packagephobia.com/result?p=deferable)
[![license](https://img.shields.io/npm/l/deferable.svg)](LICENSE)

Deferred promises for JavaScript and TypeScript: hand out a promise **now**,
decide **later** when (or whether) the work behind it runs.

- Zero dependencies, tiny, ESM, ships its own TypeScript types
- `Defer(fn)` - lazy promise with an explicit `trigger()`
- `DeferredPromise` - a promise you can `resolve()` / `reject()` from outside
- `DeferredTrigger` - class form of `Defer`
- Runs the work at most once, turns synchronous throws into rejections

Its sibling [prmsq](https://github.com/webduvet/prmsq) builds a rate-limited promise queue on top of it.

## Install

```sh
npm install deferable
```

Requires Node.js 20.19+ (or any modern bundler/browser). The package is ESM;
`require('deferable')` also works on Node 20.19+ / 22.12+.

## Usage

### `Defer(workload)`

```js
import { Defer } from 'deferable';

const { promise, trigger, onTrigger, called } = Defer((id) => fetch(`/api/items/${id}`));

onTrigger(() => console.log('request started'));

consumer(promise); // hand the promise out - nothing has been requested yet

trigger(42);       // arguments are forwarded to the workload
```

| Member | Description |
| --- | --- |
| `promise` | Promise for the workload's result. Stays pending until `trigger()`. |
| `trigger(...args)` | Starts the workload. Only the first call runs it; later calls return the same promise. Returns a promise that resolves once `promise` has settled and **never rejects** - handle errors through `promise`. |
| `onTrigger(cb)` | Registers a callback invoked once, right before the workload starts. |
| `called` | `true` after `trigger()` has been called. |

The workload may return a promise or a plain value. If it throws synchronously,
`promise` rejects.

### `DeferredTrigger`

```js
import { DeferredTrigger } from 'deferable';

const lazy = new DeferredTrigger(() => fetch(url));
consumer(lazy);  // it *is* a promise
lazy.trigger();  // starts the fetch (once)
```

### `DeferredPromise`

```js
import { DeferredPromise } from 'deferable';

const deferred = new DeferredPromise();
consumer(deferred);

legacyApi.on('data', (data) => deferred.resolve(data));
legacyApi.on('error', (err) => deferred.reject(err));
```

`then()` / `catch()` / `finally()` return ordinary `Promise`s.

### TypeScript

Types are included and infer the result type:

```ts
const d = Defer(async (n: number) => String(n)); // Deferred<string>
d.trigger(1);
const s: string = await d.promise;
```

### Note on unhandled rejections

`promise` is a normal promise: if the workload fails and nobody handles
`promise`, Node reports an unhandled rejection. Always attach a handler (or use
`Promise.allSettled`).

## Development

```sh
npm ci
npm test            # unit + packaging integration tests (node:test)
npm run test:types  # type definitions
npm run coverage
npm run example
```

The packaging integration test runs `npm pack`, installs the tarball into a
scratch project and imports it via `import` and `require`. CI runs on Node 20,
22 and 24, and a [weekly workflow](.github/workflows/weekly.yml) re-tests
against the newest Node and the newest allowed dependencies and audits them.

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [CHANGELOG](CHANGELOG.md).

## License

[MIT](LICENSE) © Andrej Bartko
