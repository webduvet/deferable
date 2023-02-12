import {
	Defer,
	Deferred,
} from './Deferred.js'

import fakeCall from './fakeCall.js'



const deferred = Defer(fakeCall)


deferred
	.promise
	.then(console.log)
	.catch(console.error)
	.finally(() => {console.log("finally promise")})


console.log(`called: ${deferred.called}`)

deferred
	.execute(() => {
		console.log('...all is finished')
	})


console.log(`called: ${deferred.called}`)

deferred.execute()

deferred
	.execute(() => {
		console.log('...all is finished')
	})




