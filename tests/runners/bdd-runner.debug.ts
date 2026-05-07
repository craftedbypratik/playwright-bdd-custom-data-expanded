import fs from 'fs';
import { execSync } from 'child_process';

import { prepareRun } from './bdd-runner-prep.utils';

/**
 * SUPPORTED COMMANDS
 *
 * 1) bdd-runner.debug.ts
 *    → RunConfig tests, all projects, opens Playwright Inspector
 *
 * 2) bdd-runner.debug.ts --project=chrome
 *    → RunConfig tests, chrome only, opens Playwright Inspector
 *
 * 3) bdd-runner.debug.ts --test=tc001
 *    → tc001, all projects, opens Playwright Inspector
 *
 * 4) bdd-runner.debug.ts --test=tc001 --project=chrome
 *    → tc001, chrome only, opens Playwright Inspector
 *
 * NOTES
 * - Forces --workers=1 automatically (parallel debug is not useful)
 * - Forces --timeout=0 automatically (disables timeouts while stepping)
 * - Cleanup happens after the Inspector session ends
 */
async function main() {
  const { baseCmd, generatedDir } = await prepareRun();

  // workers=1 and timeout=0 are always enforced in debug mode
  const cmd = `${baseCmd} --debug --workers=1 --timeout=0`;

  console.log('\n>> Executing (Debug mode):\n', cmd, '\n');

  try {
    execSync(cmd, { stdio: 'inherit' });
  } finally {
    /* -------------------------------------------------- */
    /* Cleanup — runs after Inspector session ends        */
    /* -------------------------------------------------- */
    console.log('Cleaning up...');
    if (fs.existsSync(generatedDir)) {
      fs.rmSync(generatedDir, { recursive: true, force: true });
    }
  }
}

main().catch((err) => {
  console.error('\nBDD Debug Runner failed\n');
  console.error(err);
  process.exit(1);
});
