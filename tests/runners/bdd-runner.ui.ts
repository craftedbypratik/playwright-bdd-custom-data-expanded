import fs from 'fs';
import { execSync } from 'child_process';

import { prepareRun } from './bdd-runner-prep.utils';

/**
 * SUPPORTED COMMANDS
 *
 * 1) bdd-runner.ui.ts
 *    → RunConfig tests, all projects, opens Playwright UI
 *
 * 2) bdd-runner.ui.ts --project=chrome
 *    → RunConfig tests, chrome only, opens Playwright UI
 *
 * 3) bdd-runner.ui.ts --test=tc001
 *    → tc001, all projects, opens Playwright UI pre-filtered
 *
 * 4) bdd-runner.ui.ts --test=tc001 --project=chrome
 *    → tc001, chrome only, opens Playwright UI pre-filtered
 *
 * NOTES
 * - Generated features stay on disk while the UI is open so in-session re-runs work
 * - Cleanup happens after the UI window is closed (execSync blocks until then)
 */
async function main() {
  const { baseCmd, generatedDir } = await prepareRun();

  const cmd = `${baseCmd} --ui`;

  console.log('\n>> Executing (UI mode):\n', cmd, '\n');

  try {
    execSync(cmd, { stdio: 'inherit' });
  } finally {
    /* -------------------------------------------------- */
    /* Cleanup — runs after UI window is closed           */
    /* -------------------------------------------------- */
    console.log('Cleaning up...');
    if (fs.existsSync(generatedDir)) {
      fs.rmSync(generatedDir, { recursive: true, force: true });
    }
  }
}

main().catch((err) => {
  console.error('\nBDD UI Runner failed\n');
  console.error(err);
  process.exit(1);
});
