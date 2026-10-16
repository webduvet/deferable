// Compile-time checks only: run with `npm run test:types`.
import { Defer, DeferredPromise, DeferredTrigger, type Deferred } from '../src/index.js';

const a: Deferred<number> = Defer(() => Promise.resolve(1));
const b: Deferred<string> = Defer((n: number) => String(n));
const n: Promise<number> = a.promise;
const done: Promise<void> = b.trigger(1);
const flag: boolean = a.called;
a.onTrigger(() => {});

const p = new DeferredPromise<number>();
p.resolve(1);
const t = new DeferredTrigger(() => 'x');
const s: Promise<string> = t;

// @ts-expect-error - workload must be a function
Defer(Promise.resolve(1));
// @ts-expect-error - resolve expects the promised type
p.resolve('nope');
// @ts-expect-error - promise is read-only
a.promise = Promise.resolve(2);

export { n, done, flag, s };
