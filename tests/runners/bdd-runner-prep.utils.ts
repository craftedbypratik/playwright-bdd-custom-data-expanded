import fs from 'fs';
import path from 'path';
import glob from 'glob';
import { execSync } from 'child_process';

import { expandFeatureWithExternalData } from '../utils/bdd-expander/excel-bdd-expander';
import { RunConfigOperations } from '../utils/run-config-operations.utils';

export interface RunnerPrepResult {
  /** Base playwright command with --grep and --project already applied */
  baseCmd: string;
  /** Absolute path to the generated features directory */
  generatedDir: string;
}

/**
 * Shared prep logic for all BDD runner variants.
 *
 * 1. Parses --test= and --project= CLI flags
 * 2. Resolves runnable tags from RunConfig or --test flag
 * 3. Expands feature files with external data
 * 4. Runs bddgen
 * 5. Returns a base playwright command and generatedDir path
 *
 * The caller is responsible for:
 * - Appending mode-specific flags (--ui, --debug, etc.)
 * - Executing the command
 * - Cleaning up generatedDir after the session ends
 */
export async function prepareRun(): Promise<RunnerPrepResult> {
  const args = process.argv.slice(2);

  let testId: string | undefined;
  let project: string | undefined;

  /* -------------------------------------------------- */
  /* Parse CLI flags                                    */
  /* -------------------------------------------------- */
  for (const arg of args) {
    if (arg.startsWith('--test=')) {
      testId = arg.split('=')[1]?.trim();
    }

    if (arg.startsWith('--project=')) {
      project = arg.split('=')[1]?.trim();
    }
  }

  /* -------------------------------------------------- */
  /* Resolve runnable tags                              */
  /* -------------------------------------------------- */
  let runnableTags: string[] = [];

  if (testId) {
    // Explicit CLI mode → ignore RunConfig
    runnableTags = [`@${testId}`];
  } else {
    // RunConfig-driven mode
    const runConfigPath = 'tests/config/RunConfiguration.xlsx';

    if (fs.existsSync(runConfigPath)) {
      const tags = await RunConfigOperations.getRunnableTags(runConfigPath);
      runnableTags = tags.map((t) => `@${t}`);
    }
  }

  /* -------------------------------------------------- */
  /* Expand BDD features                                */
  /* -------------------------------------------------- */
  const featureFiles = glob.sync('tests/**/*.feature', {
    ignore: ['**/*.gen.feature', '**/.generated-features/**'],
  });

  if (!featureFiles.length) {
    console.warn('No feature files found.');
    process.exit(0);
  }

  const generatedDir = path.join('tests', '.generated-features');

  if (fs.existsSync(generatedDir)) {
    fs.rmSync(generatedDir, { recursive: true, force: true });
  }
  fs.mkdirSync(generatedDir, { recursive: true });

  for (const feature of featureFiles) {
    await expandFeatureWithExternalData(feature, generatedDir);
  }

  console.log('Running bddgen command...');
  execSync('npx bddgen', { stdio: 'inherit' });

  /* -------------------------------------------------- */
  /* Build base Playwright command                      */
  /* -------------------------------------------------- */
  let baseCmd = `npx playwright test`;

  if (runnableTags.length > 0) {
    console.log(`Running the following tests: ${runnableTags.join(', ').trim()}`);
    baseCmd += ` --grep "${runnableTags.map((t) => `${t}$`).join('|')}"`;
  }

  if (project) {
    baseCmd += ` --project=${project}`;
  }

  return { baseCmd, generatedDir };
}
