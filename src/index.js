/**
 * @template T
 * @typedef {Object} Deferred
 * @property {Promise<T>} promise promise for the future value
 * @property {boolean} called `true` once `trigger()` has been called
 * @property {(callback: () => void) => void} onTrigger
 * @property {(...args: any[]) => Promise<void>} trigger
 */

/**
 * A Promise that exposes its own `resolve` and `reject` handlers
 * (the classic "deferred" pattern).
 *
 * @template T
 * @extends {Promise<T>}
 */
export class DeferredPromise extends Promise {
	/**
	 * `.then()` and friends return plain promises, not DeferredPromises.
	 */
	static get [Symbol.species]() {
		return Promise;
	}

	/**
	 * @param {(resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void} [resolver]
	 *   optional function that receives `resolve` and `reject`, like a regular
	 *   Promise executor
	 */
	constructor(resolver) {
		/** @type {any} */
		const handlers = {};
		super((resolve, reject) => {
			handlers.resolve = resolve;
			handlers.reject = reject;
		});
		/** @type {(value: T | PromiseLike<T>) => void} */
		this.resolve = handlers.resolve;
		/** @type {(reason?: any) => void} */
		this.reject = handlers.reject;
		if (resolver) {
			resolver(this.resolve, this.reject);
		}
	}
}

/**
 * A DeferredPromise that does its work only when `trigger()` is called.
 *
 * @example
 * const lazy = new DeferredTrigger(() => fetch(url));
 * consume(lazy);   // nothing has been fetched yet
 * lazy.trigger();  // now it has
 *
 * @template T
 * @extends {DeferredPromise<T>}
 */
export class DeferredTrigger extends DeferredPromise {
	/** @type {(() => T | PromiseLike<T>) | undefined} */
	#workload;
	/** @type {Promise<void> | undefined} */
	#run;

	/**
	 * @param {() => T | PromiseLike<T>} load function doing the actual work.
	 *   (A two-argument function is treated as a plain resolver, as in
	 *   DeferredPromise.)
	 */
	constructor(load) {
		if (typeof load !== 'function') {
			throw new TypeError('DeferredTrigger expects a function');
		}
		if (load.length === 2) {
			// @ts-ignore - resolver form
			super(load);
		} else {
			super();
			this.#workload = load;
		}
	}

	/**
	 * Runs the workload (only the first time) and settles this promise with
	 * its outcome.
	 *
	 * @returns {Promise<void>} resolves once this promise is settled; never rejects
	 */
	trigger() {
		if (!this.#run) {
			const workload = this.#workload;
			if (workload) {
				try {
					Promise.resolve(workload()).then(this.resolve, this.reject);
				} catch (err) {
					this.reject(err); // synchronous throw
				}
			}
			this.#run = this.then(
				() => {},
				() => {}
			);
		}
		return this.#run;
	}
}

/**
 * Wraps a promise-returning function so it only runs when `trigger()` is
 * called, while handing out the future promise right away.
 *
 * @example
 * const { promise, trigger } = Defer(() => fetch(url));
 * consume(promise);   // nothing has been fetched yet
 * trigger();          // now it has
 *
 * @template T
 * @template {any[]} A
 * @param {(...args: A) => T | PromiseLike<T>} workload
 * @returns {Deferred<Awaited<T>>}
 */
export function Defer(workload) {
	if (typeof workload !== 'function') {
		throw new TypeError('Defer expects a function');
	}
	/** @type {(v: any) => void} */ let resolve;
	/** @type {(r?: any) => void} */ let reject;
	const promise = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});
	/** @type {Array<() => void>} */
	const listeners = [];
	/** @type {Promise<void> | undefined} */
	let run;

	return {
		get promise() {
			return promise;
		},

		get called() {
			return run !== undefined;
		},

		/**
		 * Registers a callback invoked once, when the workload starts.
		 * @param {() => void} callback
		 */
		onTrigger(callback) {
			if (typeof callback !== 'function') {
				throw new TypeError('Callback must be type of function.');
			}
			listeners.push(callback);
		},

		/**
		 * Starts the workload (only the first call has an effect; later calls
		 * return the same promise). Arguments are forwarded to the workload.
		 * The returned promise resolves once `promise` has settled and never
		 * rejects itself - handle failures through `promise`.
		 *
		 * @param {...any} args
		 * @returns {Promise<void>}
		 */
		trigger(...args) {
			if (run) return run;
			listeners.forEach((fn) => fn());
			run = new Promise((resolveRun) => {
				try {
					Promise.resolve(workload(.../** @type {any} */ (args))).then(resolve, reject);
				} catch (err) {
					reject(err); // synchronous throw
				}
				promise.then(
					() => resolveRun(),
					() => resolveRun()
				);
			});
			return run;
		},
	};
}
