/**
 * The object returned by {@link Defer}: a promise for the future value plus
 * the lever that starts the work.
 */
export interface Deferred<T> {
  /** Promise for the value; stays pending until `trigger()` is called. */
  readonly promise: Promise<T>;
  /** `true` once `trigger()` has been called. */
  readonly called: boolean;
  /** Registers a callback that runs once, when the workload starts. */
  onTrigger(callback: () => void): void;
  /**
   * Starts the workload (first call only; later calls return the same promise)
   * and forwards its arguments. The returned promise resolves once `promise`
   * has settled and never rejects - handle failures through `promise`.
   */
  trigger(...args: any[]): Promise<void>;
}

/**
 * Wraps a function returning a promise (or a plain value) so that it only runs
 * when `trigger()` is called.
 */
export function Defer<T, A extends any[] = any[]>(
  workload: (...args: A) => T | PromiseLike<T>
): Deferred<Awaited<T>>;

/** A Promise exposing its own `resolve` and `reject` handlers. */
export class DeferredPromise<T = unknown> extends Promise<T> {
  constructor(
    resolver?: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void
    ) => void
  );
  readonly resolve: (value: T | PromiseLike<T>) => void;
  readonly reject: (reason?: any) => void;
}

/** A DeferredPromise that runs `load` only when `trigger()` is called. */
export class DeferredTrigger<T = unknown> extends DeferredPromise<T> {
  constructor(load: () => T | PromiseLike<T>);
  /** Runs the workload once; resolves when settled and never rejects. */
  trigger(): Promise<void>;
}
