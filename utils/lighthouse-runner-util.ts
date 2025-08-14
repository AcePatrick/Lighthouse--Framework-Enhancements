import fs from 'fs';
import { execSync } from 'child_process';

import { getChromeFlags, getLighthousePreset } from '@config/lighthouse.config';
import { reportTimestamp } from '@config/lighthouse.config';

import { arrangeFiles, getLighthouseOutputFilePaths } from '@utils/report-path-util';
import { screenshotDiagnosticsBlock } from '@utils/screenshot-util';
import { performanceScoreRating } from '@utils/performance-score-rating-util';
import { textWriterUtil } from '@utils/text-writer-util';

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

  try {
    console.log(`\n🚀 Running Lighthouse [${label}] on ${url}`);
    
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

    // Write data to txt file
    const jsonReportPath = `${reportPath}.report.json`;
    const report = JSON.parse(fs.readFileSync(jsonReportPath, 'utf8'));
    const performanceScore = Math.round(report.categories.performance.score * 100);
    
    const logTimestamp = reportTimestamp(report.fetchTime);
    
    // console.log('📋 Report Rating: ${performanceScoreRating(performanceScore)}');
    
    const htmlReportPath = `${reportPath}.report.html`;
    let {
      diagnosticsData,
      auditsData
    } = await screenshotDiagnosticsBlock(outputDir, htmlReportPath, label, url, device, isIncognito, screenshotOption);

    // Write data on text file
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

    // After all report generation
    if (runIndex === totalRuns - 1) {
      console.log('\n🧹 Arranging files on last run...');
      await arrangeFiles(outputDir);
      console.log(`\n✅ Done. Lighthouse report saved in: ${outputDir}`);
    }
    
  } catch (err) {
    console.error(`\n❌ Lighthouse failed for ${label}:`, err);
  }
};