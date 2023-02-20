import {
    Defer,
    DeferredPromise,
    DeferredTrigger,
} from '../src/Deferred.js'

import {
    fakeCall
} from '../src/utils.js'

import {
	assert 
} from 'chai'

describe('deferable', function() {
    describe('Defer', function() {
        it('Should return object containing promise and trigger function', function() {
            const p = Defer(() => fakeCall());

            assert.equal(typeof p, 'object');
            assert.property(p, 'promise');
            assert.property(p, 'called');
            assert.property(p, 'trigger');
        });

        it('calling trigger should set called flag to true', function() {
            const deferred = Defer(() => new Promise((res) => { res('resolved') }));

            assert.isFalse(deferred.called);
            deferred.trigger();
            assert.isTrue(deferred.called);
        })

        it('should start promise resolution when called trigger()', function(done) {
            const executorFn = () => new Promise(
                (res) => {
                    setTimeout(function(){res('resolved')}, 0)
                })
            const deferred = Defer(executorFn);

            assert.isFalse(deferred.called);

            deferred.trigger();

            deferred.promise
                .then(value => {
                    assert.equal(value, 'resolved')
                    done();
                })
                .catch(() => {
                    assert.fail()
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

    describe('DeferredTrigger', function() {
        it('DeferredTrigger is Promise', function() {
            const executorFn = () => new Promise(
                (res) => {
                    setTimeout(function(){res('resolved')}, 0)
                })
            const _p = new DeferredTrigger(executorFn)

            assert.instanceOf(_p, Promise)
        });

		it('DeferredTrigger can be triggered via trigger method', function(done) {
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
