import path from 'path';

import { SINGLE_TEST_URL } from '@config/lighthouse.config';
import { folderTimestamp } from '@config/lighthouse.config';

import { runLighthouse } from '@utils/lighthouse-runner-util';
import { askScreenshotOption } from '@utils/user-input-util';
import { prepareExcelCopy, writeAllToExcel } from '@utils/excel-writer-util';
import { getLighthouseOutputPaths } from '@utils/report-path-util';

const devices: ('Mobile' | 'Desktop')[] = ['Mobile', 'Desktop'];
const modes: boolean[] = [false, true]; // false = normal, true = incognito

const lighthouseRuns: Promise<void>[] = [];

// Run all 4 in parallel and wait for all to finish
(async () => {
  const screenshotOption = await askScreenshotOption();

  const url = [SINGLE_TEST_URL];
  let taskIndex = 0;
  const totalTasks = url.length * devices.length * modes.length;

  const outputDir = await getLighthouseOutputPaths(folderTimestamp);
  const excelPath = prepareExcelCopy(outputDir);
  
  for (const device of devices) {
    for (const isIncognito of modes) {
      const modeLabel = isIncognito ? 'Incognito' : 'Normal';
      const label = `${device}-${modeLabel}`;

      let currentIndex = taskIndex++;

      lighthouseRuns.push(runLighthouse(
        url.toString(),
        device,
        isIncognito,
        screenshotOption,
        currentIndex,
        totalTasks,
        label,
        outputDir,
      ));
    }
  }

  await Promise.all(lighthouseRuns);

  await writeAllToExcel(
    path.join(outputDir, 'lighthouse-simplified-data.txt'),
    excelPath
  );
  console.log('\n🌟 All Lighthouse runs completed.');
})();