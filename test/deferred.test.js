import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DeferredPromise, DeferredTrigger } from '../src/index.js';

describe('DeferredPromise', () => {
	it('is a Promise exposing resolve and reject', () => {
		const p = new DeferredPromise();
		assert.ok(p instanceof Promise);
		assert.equal(typeof p.resolve, 'function');
		assert.equal(typeof p.reject, 'function');
	});

	it('resolves via resolve()', async () => {
		const p = new DeferredPromise();
		p.resolve('ok');
		assert.equal(await p, 'ok');
	});

	it('rejects via reject()', async () => {
		const p = new DeferredPromise();
		p.reject(new Error('no'));
		await assert.rejects(p, /no/);
	});

	it('hands resolve/reject to an optional resolver', async () => {
		const p = new DeferredPromise((resolve) => resolve(7));
		assert.equal(await p, 7);
	});

	it('chains into plain promises', () => {
		const p = new DeferredPromise();
		p.resolve(1);
		const chained = p.then((v) => v);
		assert.equal(chained.constructor, Promise);
		return chained;
	});
});

describe('DeferredTrigger', () => {
	it('is a Promise', () => {
		const t = new DeferredTrigger(() => 1);
		assert.ok(t instanceof Promise);
	});

	it('stays pending until trigger() is called', async () => {
		let ran = false;
		const t = new DeferredTrigger(async () => {
			ran = true;
			return 'done';
		});
		await new Promise((r) => setTimeout(r, 10));
		assert.equal(ran, false);
		await t.trigger();
		assert.equal(ran, true);
		assert.equal(await t, 'done');
	});

	it('runs the workload only once', async () => {
		let count = 0;
		const t = new DeferredTrigger(() => ++count);
		await Promise.all([t.trigger(), t.trigger()]);
		assert.equal(count, 1);
	});

	it('rejects when the workload rejects or throws', async () => {
		const a = new DeferredTrigger(() => Promise.reject(new Error('a')));
		await a.trigger();
		await assert.rejects(a, /a/);

		const b = new DeferredTrigger(() => {
			throw new Error('b');
		});
		await b.trigger();
		await assert.rejects(b, /b/);
	});

	it('supports the two-argument resolver form', async () => {
		const t = new DeferredTrigger((resolve, _reject) => resolve('direct'));
		assert.equal(await t, 'direct');
	});

	it('rejects a non-function', () => {
		assert.throws(() => new DeferredTrigger(), TypeError);
	});
});
