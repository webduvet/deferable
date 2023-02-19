//import {
	//assert,
	//describe,
//} from 'sinon';
//

//import sinon from 'sinon'

//const sinon = require('sinon')

//import {
	//Defer,
	//Deferred,
//} from './src/Deferred.js'

//import fakeCall from './fakeCall.js'

import {
	assert 
} from 'chai'

describe('Defer', function() {
	it('Should return executor function', function() {
		const p = Defer(() => fakeCall());

		assert.equal(typeof p, 'function');
		assert.true(p instanceof Promise);
	});

	it('executor function should return Promise instance and trigger', function() {
		const p = Defer(() => fakeCall());

		const { promise, trigger, called } = p();

		assert.true(promise instanceof Promise);
		assert.true(typeof trigger === 'function');
		assert.true(typeof called === 'boolean');
	});

	it('calling trigger should set called flag to true', function() {
		const deferred = Defer(() => new Promise((res) => { res('resolved') }));

		assert.false(deferred.called);
		deferred.trigger();
		assert.true(deferred.called);
	})

	it('should start promise resolution when called trigger()', function(done) {
		const deferred = Defer(() => new Promise(
			(res) => { setTimeout(fucntion() {res('resolved')}) }));

		assert.false(deferred.called);

		deferred.trigger();

		deferred.promise
			.then(value => {
				assert.equal(value, 'resolved')
				done();
			})
			.catch(() => {
				assert.true(false)
			})

	})
})
