// Packs the library exactly as it would be published, installs the tarball into a
// scratch project and imports it the way a consumer would (ESM and require()).
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
let dir;

describe('packed package', () => {
	before(() => {
		dir = mkdtempSync(join(tmpdir(), 'deferable-it-'));
		const packDir = join(dir, 'pack');
		mkdirSync(packDir);
		execFileSync(npm, ['pack', '--pack-destination', packDir, '--silent'], { cwd: root });
		const tarball = readdirSync(packDir)[0];
		writeFileSync(join(dir, 'package.json'), '{"name":"consumer","private":true}');
		execFileSync(npm, ['install', '--no-audit', '--no-fund', join(packDir, tarball)], { cwd: dir });
	});
	after(() => rmSync(dir, { recursive: true, force: true }));

	const run = (args) => execFileSync(process.execPath, args, { cwd: dir }).toString().trim();

	it('can be imported as ESM', () => {
		const out = run([
			'--input-type=module',
			'-e',
			`import { Defer } from 'deferable';
			 const d = Defer(async () => 'esm'); d.trigger(); console.log(await d.promise);`,
		]);
		assert.equal(out, 'esm');
	});

	it('can be loaded with require()', () => {
		const out = run([
			'-e',
			`const { Defer } = require('deferable');
			 const d = Defer(async () => 'cjs'); d.trigger(); d.promise.then(console.log);`,
		]);
		assert.equal(out, 'cjs');
	});
});
