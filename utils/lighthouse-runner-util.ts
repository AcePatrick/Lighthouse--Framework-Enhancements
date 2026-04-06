import fs from 'fs';
import { execSync } from 'child_process';

import { getChromeFlags, getLighthousePreset, reportTimestamp } from '@config/lighthouse.config';
import { arrangeFiles, getLighthouseOutputFilePaths } from '@utils/report-path-util';
import { screenshotDiagnosticsBlock } from '@utils/screenshot-util';
import { textWriterUtil } from '@utils/text-writer-util';
import { performanceScoreRating } from './performance-score-rating-util';

const MAX_RERUNS = 3; // Maximum reruns when rating is Poor

export const runLighthouse = async (
  url: string,
  device: 'Mobile' | 'Desktop',
  isIncognito: boolean,
  screenshotOption: number,
  runIndex: number,
  totalRuns: number,
  label: string,
  outputDir: string,
) => {

  const { reportPath, htmlReportFile, logPath } = await getLighthouseOutputFilePaths(label, url, outputDir);
  const chromeFlags = getChromeFlags(isIncognito);
  const preset = getLighthousePreset(device);

  let attempt = 0;
  let performanceScore = 0;
  let rating = "";

  while (attempt < MAX_RERUNS) {
    attempt++;

    console.log(`\n🚀 Running Lighthouse [${label}] (Attempt ${attempt}/${MAX_RERUNS}) on ${url}`);

    try {
      if (device === "Desktop") {
        execSync(`npx lighthouse ${url} \
          --output json \
          --output html \
          --output-path "${reportPath}" \
          ${preset} \
          --quiet \
          --chrome-flags="${chromeFlags}" \
          --no-enable-error-reporting`,
          { stdio: 'inherit' }
        );
      } else {
        const cpuMultiplier = 3;
        execSync(`npx lighthouse ${url} \
          --output json \
          --output html \
          --output-path "${reportPath}" \
          ${preset} \
          --quiet \
          --chrome-flags="${chromeFlags}" \
          --no-enable-error-reporting \
          --throttling-method=devtools \
          --throttling.cpuSlowdownMultiplier=${cpuMultiplier}`,
          { stdio: 'inherit' }
        );
      }

      // Read JSON report
      const jsonReportPath = `${reportPath}.report.json`;
      const report = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));
      performanceScore = Math.round(report.categories.performance.score * 100);
      rating = performanceScoreRating(performanceScore);

      console.log(`📋 Report Rating: ${rating} at ${performanceScore}`);

      // Stop rerun early if not Poor
      if (rating !== "💣 Poor") {
        console.log(`✅ Acceptable score achieved. Reruns will be stopped.`);
        break;
      }

      if (attempt < MAX_RERUNS) {
        console.log(`🔁 Poor score detected. Rerunning Lighthouse...`);
      }

    } catch (err) {
      console.error(`❌ Lighthouse failed on attempt ${attempt}:`, err);
      throw err;
    }
  }

  // ✅ After last run, process report normally
  const jsonReportPath = `${reportPath}.report.json`;
  const report = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));
  const logTimestamp = reportTimestamp(report.fetchTime);

  let { diagnosticsData, auditsData } = await screenshotDiagnosticsBlock(
    outputDir,
    `${reportPath}.report.html`,
    label,
    url,
    device,
    isIncognito,
    screenshotOption
  );

  textWriterUtil(
    logPath,
    logTimestamp,
    url,
    label,
    performanceScore,
    diagnosticsData.diagnosticTitleTxt,
    diagnosticsData.diagnosticDisplayTxt,
    diagnosticsData.diagnosticRedirectTxt,
    diagnosticsData.diagnosticRedirectLinkTxt,
    diagnosticsData.diagnosticScreenshotPath,
    auditsData.auditTitleTxt,
    auditsData.auditRedirectTxt,
    auditsData.auditRedirectLinkTxt,
    auditsData.auditScreenshotPath,
    htmlReportFile,
    outputDir
  );

  // Arrange files after last run of all URLs
  if (runIndex === totalRuns - 1) {
    console.log('\n🧹 Arranging files on last run...');
    await arrangeFiles(outputDir);
    console.log(`\n✅ Done. Lighthouse report saved in: ${outputDir}`);
  }
};
