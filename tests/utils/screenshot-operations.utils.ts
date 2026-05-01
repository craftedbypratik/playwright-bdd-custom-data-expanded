import { test, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

type Shot = {
  path: string;
  name: string;
  time: string;
};

export class ScreenshotOperations {

  private static readonly shotsByTest = new Map<string, Shot[]>();

  private static getTestKey(): string {
    const info = test.info();
    return [
      info.project.name,
      info.titlePath.join('::'),
      info.retry,
      info.repeatEachIndex,
    ].join('::');
  }

  static clear(): void {
    ScreenshotOperations.shotsByTest.delete(ScreenshotOperations.getTestKey());
  }

  static getShots(): Shot[] {
    return ScreenshotOperations.shotsByTest.get(ScreenshotOperations.getTestKey()) ?? [];
  }

  static async save(
    page: Page,
    name: string
  ): Promise<void> {

    const buffer = await page.screenshot();

    const safeName = name
      .replace(/[\/\\:?*"<>|]/g, '-')
      .replace(/\s+/g, '-')
      .substring(0, 150);

    const key = ScreenshotOperations.getTestKey();
    const shots = ScreenshotOperations.shotsByTest.get(key) ?? [];

    const dir = path.join(test.info().outputDir, 'screens');
    fs.mkdirSync(dir, { recursive: true });

    const filename = `${Date.now()}-${safeName}.png`;
    const filepath = path.join(dir, filename);

    fs.writeFileSync(filepath, buffer);

    shots.push({ path: filepath, name, time: new Date().toISOString() });
    ScreenshotOperations.shotsByTest.set(key, shots);

    console.info(`[Screenshot saved] ${name}`);
  }

  static async attach(
    page: Page,
    name: string
  ): Promise<void> {

    const buffer = await page.screenshot();

    await test.info().attach(name, {
      body: buffer,
      contentType: 'image/png'
    });

    console.info(`[Screenshot attached to report] ${name}`);
  }
}