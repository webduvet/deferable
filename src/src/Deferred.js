

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
	constructor(resolver=function(resolve, reject) {}) {
		const that = {};
		super(function(resolve, reject) {
			Object.assign(that, {resolve, reject})
		});
		Object.assign(this, that)
		resolver(this.resolve, this.reject)
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
export class DefferedTrigger extends DeferredPromise {
	constructor(workload) {
		super();
		this._workload = workload
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
 * defer the execution of the workload
 *
 * @param {Function} factory function returning a Promise (which needs to be deffered)
 *
 * @returns {Objcect} with deferred promise and an executor which triggers the promise fullfillment
 **/
export function Defer(workload) {
	let _reject, _resolve, _called;
	const _p = new Promise(function (resolve, reject) {
		_resolve = resolve;
		_reject = reject;
	}.bind(Defer))

	const executor = (function (workload) {
		let _executor = undefined;

		return function() {
			_called = true;
			if (_executor) {
				return _executor;
				console.log('returning original')
			}
			return _executor = workload()
				.then(data => {
					_resolve(data)
				})
				.catch(reason => {
					_reject(reason)
				})
		}
	})(workload)

	return {
		get promise() { return _p },

		get called() {
			return _called ? true : false;
		},

		execute(callback=function() {}) {
			executor().finally(callback)
		}
	}
}
