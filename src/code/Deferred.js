

/**
 * @desc
 * implements deferred pattern
 * extended promise with exposed resolve and reject handlers
 *
 * passed resolver function
 *
 * @param? {Function} resolver function taking two params: function resolve and function reject
 * 		this parameter is provided as default
 */
export class DeferredPromise extends Promise {
	constructor(resolver) {
		const that = {};
		super(function(resolve, reject) {
			Object.assign(that, {resolve, reject})
		});
		Object.assign(this, that)
		if (resolver) {
			resolver(this.resolve, this.reject)
		}
	}
}

/**
 * @desc
 * extended Deferred
 *
 * example:
 * 		new Deferred(() => http.get(url))
 *
 * if we need to pass promise but we do not want to do the actual work yet
 * like e.g. REST calls throttling.
 *
 * @param {Function} takes as argument factory returning promise
 */
export class DeferredTrigger extends DeferredPromise {
	constructor(load) {
		if (load.length == 2) {
			super(load);
		}
		if (!load.length) {
			super(function(resolve, reject) {});
			this._workload = load 
		}
	}

	trigger() {
		return this._workload()
			.then((data) => {
				this.resolve(data)
			})
			.catch(reason => {
				this.reject(reason)
			})
	}
}

/**
 * @desc
 * factory method returning a deferred object containing a promise and the lever to trigger
 * to settle the promise.
 *
 * @param {Function} factory function returning a Promise (which needs to be deffered)
 *
 * @returns {Objcect} with deferred promise and an executor which triggers the promise fullfillment
 **/
export function Defer(workload) {
	let _reject, _resolve, _onTrigger = [];
	const _p = new Promise(function (resolve, reject) {
		_resolve = resolve;
		_reject = reject;
	}.bind(Defer))

	const _executor = (function (workload) {
		let _executorCache = undefined;

		return function(...args) {
			if (_executorCache) {
				return _executorCache;
			}
			// emit onTrigger only first time the workload is executed
			_onTrigger.forEach((fn) => { fn() })
			return _executorCache = workload(...args)
				.then(data => {
					_resolve(data)
				})
				.catch(reason => {
					_reject(reason)
				})
		}
	})(workload)

	return {
		/**
		 * @desc
		 * getter form wrapped promise
		 *
		 * @property {Promise}
		 */
		get promise() { return _p },

		/**
		 * @desc
		 * hook to notify subscribes that the promise fullfilment had been triggered
		 * without this we only know when the promise gets settled by subscribing to
		 * then or catch or finally
		 *
		 * @param {Function} callback function without parameters
		 *
		 * @returns { undefined }
		 */
		onTrigger(callback) {
			if (typeof callback === 'function') {
				_onTrigger.push(callback)
			} else {
				throw Error('Callback must be type of function.')
			}
		},

		/**
		 * @desc
		 * triggers the fullfilment of the Promise
		 * after calling this lever the Promise gets setteld
		 *
		 * @param {...any} any number of parameters passed to executor function
		 * @returns {Promise} returns the Promise which is returned from the executor function
		 */
		trigger(...args) {
			return _executor(...args)
		}
	}
}
