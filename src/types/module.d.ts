/**
 * type Deferred
 *
 * represent the container for Promise and levers
 *
 * onTrigger subscribes to event when the promise settling starts
 * trigger is the lever to start the promise settling
 *
 * promise getter returns the promise for the future value
 * 
 * without explicite call of trigger lever the promise will never get settled
 */
export type Deferred<T> = {
    promise: Promise<T>;
    onTrigger: (fn: Function) => any;
    trigger: (...p: any) => Promise<T>
};

/**
 * type Defer factory
 *
 * creates the Deferred Object
 *
 * @param {Function} factory function returning the promise of interest
 * @return {Object<Deferred>} Object wrapper for Promise and the levers
 */
export function Defer<T>(fn: Promise<T>): Deferred<T>;


/**
 * type Deferred Promise
 *
 * extends Promise with resolve and reject methods
 *
 */
export type DeferredPromise<T> = Promise<T> & {
    resolve: (value: T) => void;
    reject: (reason: any) => void;
};
