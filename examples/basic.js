import { Defer, DeferredTrigger, DeferredPromise } from '../src/index.js';

// 1. Factory: hand out the promise now, do the work later.
const { promise, trigger, onTrigger } = Defer(async (name) => `hello ${name}`);
onTrigger(() => console.log('work is starting'));
promise.then((v) => console.log('Defer ->', v));
trigger('world');

// 2. Class form: a promise that starts its own work on demand.
const lazy = new DeferredTrigger(() => new Promise((r) => setTimeout(() => r('lazy'), 50)));
lazy.then((v) => console.log('DeferredTrigger ->', v));
lazy.trigger();

// 3. Plain deferred: settle it from the outside.
const external = new DeferredPromise();
external.then((v) => console.log('DeferredPromise ->', v));
setTimeout(() => external.resolve('resolved from outside'), 100);
