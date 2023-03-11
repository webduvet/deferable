import {
    Defer,
    DeferredPromise,
    DeferredTrigger,
} from '../src/Deferred.js'

import {
    fakeCall
} from '../src/utils.js'

import {
	assert,
} from 'chai'

import {
	spy
} from 'sinon'


describe('deferable', function() {
    describe('Defer - factory method', function() {
        it('Should return object containing promise and trigger function', function() {
            const p = Defer(() => fakeCall());

            assert.equal(typeof p, 'object');
            assert.property(p, 'promise');
			assert.property(p, 'onTrigger');
            assert.property(p, 'trigger');
        });

        it('should start promise resolution when called trigger()', function(done) {
            const executorFn = () => new Promise(
                (res) => {
                    setTimeout(function(){res('resolved')}, 0)
                })
            const deferred = Defer(executorFn);

            deferred.trigger();

            deferred.promise
                .then(value => {
                    assert.equal(value, 'resolved')
                    done();
                })
                .catch(() => {
                    assert.fail()
                })
        });

		it('should invoke onTrigger callbacks', function() {
			let triggered = false;
			let mocked = spy()
            const executorFn = () => new Promise(
                (res) => {
                    setTimeout(function(){res('resolved')}, 100)
                })
            const deferred = Defer(executorFn);

			// test plain call
			deferred.onTrigger(function() {
				triggered = true
			})

			// test spy
			deferred.onTrigger(mocked)

            deferred.trigger();

			assert.isTrue(triggered)
			assert.isTrue(mocked.calledOnce)

            return deferred.promise
                .then(value => {
					assert.isTrue(triggered)
                })
		})
    });

    describe('Deferred Promise', function() {
        it('DeferredPromise should be instance of Promise', function() {
            const _p = new DeferredPromise(function() {})
            assert.instanceOf(_p, Promise)
        })

        it('DeferredPromise should expose resolve and reject handles', function() {
            const _p = new DeferredPromise(function() {})

            assert.property(_p, 'resolve')
            assert.property(_p, 'reject')
        })

        it('DeferredPromise should resolve with resolve handle', function(done) {
            const _p = new DeferredPromise(function() {})

            _p.resolve('resolved')

            _p.then(value => {
                assert.equal(value, 'resolved')
            }).finally(done) 
        })

        it('DeferredPromise should reject with reject handle', function() {
            const _p = new DeferredPromise(function() {})

            _p.reject('rejected')

            _p.catch(reason => {
                assert.equal(reson, 'rejected')
            }) 
        })
    })

    describe('Deferred Promise with trigger', function() {
        it('DeferredTrigger is Promise', function() {
            const executorFn = () => new Promise(
                (res) => {
                    setTimeout(function(){res('resolved')}, 0)
                })
            const _p = new DeferredTrigger(executorFn)

            assert.instanceOf(_p, Promise)
        });

		it('trigger method will trigger Promise settling', function(done) {
            const executorFn = () => new Promise(
                (res) => {
                    setTimeout(function(){res('resolved')}, 0)
                })
            const _p = new DeferredTrigger(executorFn)

            _p.then(value => {
                assert.equal(value, 'resolved');
                done()
            })
            _p.trigger()
		});
    })
})
