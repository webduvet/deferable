# Changelog

## Unreleased (proposed 1.0.0)

### Breaking
- Package is now native ESM and no longer ships a Babel-compiled CommonJS build
  (`require()` works on Node 20.19+/22.12+). Minimum Node.js is 20.19.
- `trigger()` is typed `Promise<void>` (it always resolved with `undefined`).

### Added
- `called` flag on the object returned by `Defer`, as the old README claimed.
- Real TypeScript definitions (`Defer` previously required a `Promise` argument).
- `DeferredTrigger.trigger()` is idempotent and handles synchronous throws.
- Input validation (`TypeError`) for non-function arguments.
- Packaging integration test, type tests, coverage script.
- CI matrix (Node 20/22/24), weekly health-check workflow, Dependabot,
  npm provenance on publish, CONTRIBUTING guide.

### Changed
- Zero build step, zero runtime dependencies (was `@babel/runtime`).
- `.then()` on a `DeferredPromise` returns a plain `Promise`.
- License field corrected to MIT (matches the LICENSE file).
- README rewritten.
