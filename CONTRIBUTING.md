# Contributing

Issues and pull requests are welcome.

1. Fork and create a branch.
2. `npm ci`
3. Make your change with tests (`test/*.test.js`, using `node:test`).
4. `npm run check` (types + tests) must pass.
5. Open a pull request; describe the behaviour change.

Releases: bump the version and update `CHANGELOG.md`, merge, then either publish
a GitHub release or run the `Publish to npm` workflow manually from the Actions
tab (a manual run also creates the GitHub release). Packages are published with
provenance.
