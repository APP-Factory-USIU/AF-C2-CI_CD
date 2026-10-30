import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { it } from 'node:test';

const lockfile = JSON.parse(
  readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'),
) as {
  packages: Record<string, {
    version?: string;
    optionalDependencies?: Record<string, string>;
  }>;
};

// A lockfile created with an existing node_modules directory can silently omit
// other platforms' native bindings. npm ci will not restore those missing entries.
for (const [packagePath, pkg] of Object.entries(lockfile.packages)) {
  if (!/node_modules\/(rolldown|@tailwindcss\/oxide|lightningcss)$/.test(packagePath)) continue;

  it(`locks every optional native binding for ${packagePath}`, () => {
    for (const [name, version] of Object.entries(pkg.optionalDependencies ?? {})) {
      // npm may hoist a binding or install it beneath its parent package.
      let directory = packagePath;
      let binding = lockfile.packages[`${directory}/node_modules/${name}`];
      while (!binding && directory.includes('node_modules/')) {
        directory = directory.slice(0, directory.lastIndexOf('node_modules/')).replace(/\/$/, '');
        binding = lockfile.packages[`${directory ? `${directory}/` : ''}node_modules/${name}`];
      }
      assert.ok(binding, `${packagePath} is missing ${name} from the lockfile`);
      assert.equal(binding.version, version, `${name} must match its native loader`);
    }
  });
}
