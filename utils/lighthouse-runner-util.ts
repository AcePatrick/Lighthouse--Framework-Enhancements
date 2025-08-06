import fs from 'fs';
import { execSync } from 'child_process';

import { getChromeFlags, getLighthousePreset } from '@config/lighthouse.config';
import { reportTimestamp } from '@config/lighthouse.config';

import { arrangeFiles, getLighthouseOutputFilePaths } from '@utils/report-path-util';
import { screenshotDiagnosticsBlock } from '@utils/screenshot-util';
import { performanceScoreRating } from '@utils/performance-score-rating-util';

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
    
    console.log('\n📋 Report Summary');
    console.log('======================');
    console.log(`URL: ${url}`);
    console.log(`Mode: ${label}`);
    console.log(`Date & Time: ${logTimestamp}`);
    console.log(`Performance Score: ${performanceScore}`);
    console.log(`Rating: ${performanceScoreRating(performanceScore)}`);
    
    const htmlReportPath = `${reportPath}.report.html`;
    let {
      diagnosticsAuditTitleTxt,
      diagnosticsAuditDisplayTxt,
      redirectTxt,
      redirectLinkTxt,
      screenshotPath
    } = await screenshotDiagnosticsBlock(outputDir, htmlReportPath, label, url, device, isIncognito, screenshotOption);

    // Write data on text file
    fs.appendFileSync(logPath, `\n[${logTimestamp}] ${url} - ${label}:`+
      `\nScore: ${performanceScore}`+
      `\nTime: ${logTimestamp}`+
      `\nDiagnostics Audit Title Text: ${diagnosticsAuditTitleTxt}` +
      `\nDiagnostics Audit Display Text: ${diagnosticsAuditDisplayTxt}`+
      `\nRedirect Text: ${redirectTxt}`+
      `\nRedirect Link Text: ${redirectLinkTxt}`+
      `\nScreenshot Path: ${screenshotPath}`+
      `\nHtml Report Path: ${htmlReportFile}.report.html`+
      `\nOutput Report Path: ${outputDir}\n`
    );

    // After all report generation
    if (runIndex === totalRuns - 1) {
      console.log('\n🧹 Arranging files on last run...');
      await arrangeFiles(outputDir);
      console.log(`\n✅ Done. Report saved in: ${outputDir}`);
    }
    
  } catch (err) {
    console.error(`\n❌ Lighthouse failed for ${label}:`, err);
  }
};