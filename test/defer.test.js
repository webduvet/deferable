import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { Defer } from '../src/index.js';

const later = (value, ms = 5) => new Promise((r) => setTimeout(() => r(value), ms));

describe('Defer', () => {
	it('returns promise, called, onTrigger and trigger', () => {
		const d = Defer(() => later(1));
		assert.ok(d.promise instanceof Promise);
		assert.equal(typeof d.trigger, 'function');
		assert.equal(typeof d.onTrigger, 'function');
		assert.equal(d.called, false);
	});

	it('does not run the workload until triggered', async () => {
		const work = mock.fn(() => later('x'));
		const d = Defer(work);
		await later(null, 20);
		assert.equal(work.mock.callCount(), 0);
		d.trigger();
		assert.equal(await d.promise, 'x');
		assert.equal(d.called, true);
	});

	it('runs the workload only once and returns the same promise', async () => {
		const work = mock.fn(() => later('x'));
		const d = Defer(work);
		const a = d.trigger();
		const b = d.trigger();
		assert.equal(a, b);
		await d.promise;
		assert.equal(work.mock.callCount(), 1);
	});

	it('forwards trigger arguments to the workload', async () => {
		const d = Defer((a, b) => a + b);
		d.trigger(2, 3);
		assert.equal(await d.promise, 5);
	});

	it('accepts a workload returning a plain value', async () => {
		const d = Defer(() => 42);
		d.trigger();
		assert.equal(await d.promise, 42);
	});

	it('rejects the promise when the workload rejects; trigger() does not reject', async () => {
		const d = Defer(() => Promise.reject(new Error('boom')));
		await assert.doesNotReject(d.trigger());
		await assert.rejects(d.promise, /boom/);
	});

	it('rejects the promise when the workload throws synchronously', async () => {
		const d = Defer(() => {
			throw new Error('sync');
		});
		await assert.doesNotReject(d.trigger());
		await assert.rejects(d.promise, /sync/);
	});

	it('trigger() resolves only after the promise settled', async () => {
		const d = Defer(() => later('x', 20));
		let settled = false;
		d.promise.then(() => (settled = true));
		await d.trigger();
		await null; // let the promise reaction run
		assert.equal(settled, true);
	});

	it('invokes every onTrigger callback once, before the workload starts', async () => {
		const order = [];
		const d = Defer(() => {
			order.push('work');
			return later(1);
		});
		const cb = mock.fn(() => order.push('cb'));
		d.onTrigger(cb);
		d.onTrigger(() => order.push('cb2'));
		d.trigger();
		d.trigger();
		await d.promise;
		assert.equal(cb.mock.callCount(), 1);
		assert.deepEqual(order, ['cb', 'cb2', 'work']);
	});

	it('throws on invalid arguments', () => {
		assert.throws(() => Defer('nope'), TypeError);
		assert.throws(() => Defer(() => 1).onTrigger('nope'), TypeError);
	});
});
