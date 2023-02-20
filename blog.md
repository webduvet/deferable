# Deferred pattern

As the name suggest it defers the execution of a code to a later stage. It is used in conjuction with Promise and sometimes it gets confused for Promise. Although both are similar there are some substantial differences.

There is a lot of different implementation of Deferred pattern also there is many implementation of Promise pattern. For the sake of simplicity I will focuse on Javascript and on current JS specification regarding Primise.

Promise is a the encapsulation of a future value. The future value might or might not exist so Promise offers handlers for both cases (`then`, `catch`). Also as per current specification it also offers simple way to handle the case when promise gets settled either way (`finally`).

Promise pattern doesn't care from where, when or how the value gets resolved.


Deferred pattern is very broad principle. In a way any Promise can be considered as Deferred pattern as the value we want to work with is not available.

What I want to talk about is two specific Deferred implementation covering a case when we do have an API expecting value wrapped in promise, but we can't trigger the Promise fullfilment yet for various reasons. We might not have some data needed for the value to get extracted from databse or we have no awailable resources to do the actuall work required to fullfill the Promise.

In this case we need to *Defer* the promise fullfilment to later stage when the system will be in a position to do it.


## Deferred as subclass of Promise

This implementation extends the existing Promise class. This is handly for cases when the `instanceof` Promise is expected.
The disadvantage if this approach is quiet tricky implementation. The Prmise object needs to be *thenable* and as per specification it need to return the Promise object instantiated from the same class as the calling object. This means internally the constructor is called with standard resolver method which we need to support. Hence the check for the resolver argument. Seconday we are robbing ourselves from any potential native performance optimisation regarding `Promise` class or it's instance.
```javascript
class DeferredPromise extends Promise {
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

var deferred = new DeferredPromise();

deferred.then(doStuffWithValue)

deferred.resolve('Hello World')
```

Enhanced implementation of this approach could work with *trigger* function which triggers the Promise fullfilment at some later, more convenient time

```javascript
class DeferredTrigger extends DeferredPromise {
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

var deferred = new DefferedTrigger(() => http.get(url))

// in some class or API expecting Promise value
deferred.then(doStuffWithValue)

// some later stage in app
deferred.trigger()
```
Please pay attention to constructor here. Because of the earlier mentioned implementation of *thenable* we need to facilitate in constructor both cases. 1. Instantiation of deferred object and instantiation of another Promise returned after calling `then` method. Which internally gets called with standerd resolver function: *function(resolve, reject){ ... }*

## Deferred as result of a factory function

```javascript
export function Defer(workload) {
	let _reject, _resolve, _called = false, _settled = false;
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
			return _called;
		},

        get settled() {
            return _settled;
        }

        trigger(callback) {
            executor().finally(() {
                _settled = true; 
                if (typeof callback === 'function') {
                    callback()
                }
            })
		}
	}
}


var deferred = Defer(() => http.get(url))

// in some class or API expecting Promise value
deferred.promise.then(doStuffWithValue)

// some later stage in app
deferred.trigger()
```

For the sake of convenience there is included two additional features. One is flag `called` to check whether the Promise settlement started or not. The second goodie is trigger function can take callback which is called after the encapsulated promise gets settled.

If anybody find this useful I wrapped all of the above in the platform agnostic `npm package`, which can be installed by `npm install deferable`.
In this blog argicle I elaborate one particular use case of Deferred Promise pattern - throttling the async calls.
