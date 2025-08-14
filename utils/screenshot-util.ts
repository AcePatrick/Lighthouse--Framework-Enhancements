import { chromium, Page } from 'playwright';
import path from 'path';
import fs from 'fs';

import { locatorExplicitWait } from '@config/lighthouse.config';
import { sanitizeUrl } from '@utils/report-path-util';
import { shouldTakeScreenshot } from '@utils/user-input-util';

export type DeviceType = 'Mobile' | 'Desktop';

export async function screenshotDiagnosticsBlock(
  outputDir: string, 
  htmlReportPath: string, 
  label: string, 
  url: string,
  device: DeviceType,
  isIncognito: boolean,
  screenshotOption: number
) {
  let diagScreenshotPath = '';
  let auditScreenshotPath = '';

  try {
    const screenshotDir = path.join(outputDir, 'screenshot');
    fs.mkdirSync(screenshotDir, { recursive: true });

    const diagScreenshotFile = `diagnostic-${sanitizeUrl(url)}-${label}.png`;
    diagScreenshotPath = path.join(screenshotDir, diagScreenshotFile);

    const auditScreenshotFile = `audit-${sanitizeUrl(url)}-${label}.png`;
    auditScreenshotPath = path.join(screenshotDir, auditScreenshotFile);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(`file://${htmlReportPath}`, { waitUntil: 'domcontentloaded' });

    const diagnosticsData = await getDiagnosticsData(
      page, device, isIncognito, screenshotOption, diagScreenshotPath, diagScreenshotFile, label, url
    );

    const auditsData = await getAuditsData(
      page, device, isIncognito, screenshotOption, auditScreenshotPath, auditScreenshotFile, label, url
    );

    await browser.close();
    return { diagnosticsData, auditsData };

  } catch (error) {
    console.error("\n⚠️ Screenshot error!", error);
    return {
      diagnosticsData: {
        diagnosticTitleTxt: '',
        diagnosticDisplayTxt: '',
        diagnosticRedirectTxt: '',
        diagnosticRedirectLinkTxt: '',
        diagnosticScreenshotPath: ''
      },
      auditsData: {
        auditTitleTxt: '',
        auditRedirectTxt: '',
        auditRedirectLinkTxt: '',
        auditScreenshotPath: ''
      }
    };
  }
}

async function getDiagnosticsData(
  page: Page,
  device: DeviceType,
  isIncognito: boolean,
  screenshotOption: number,
  diagnosticScreenshotPath: string,
  diagScreenshotFile: string,
  label: string,
  url: string
): Promise<{
  diagnosticTitleTxt: string,
  diagnosticDisplayTxt: string,
  diagnosticRedirectTxt: string,
  diagnosticRedirectLinkTxt: string,
  diagnosticScreenshotPath: string
}> {
  let diagnosticTitleTxt = '';
  let diagnosticDisplayTxt = '';
  let diagnosticRedirectTxt = '';
  let diagnosticRedirectLinkTxt = '';

  // Click "Show audits" button
  const toggleButton = await page.waitForSelector(`xpath=//button[@class="lh-button lh-button-insight-toggle"]`, { timeout: locatorExplicitWait });
  if (toggleButton) await toggleButton.click();

  // Click diagnostic block dropdown
  const diagnosticBlock = await page.waitForSelector(`xpath=//div[@class='lh-chevron-container']`, { timeout: locatorExplicitWait });
  if (diagnosticBlock) await diagnosticBlock.click();

  // Locate the diagnostic block
  const diagnosticsBlock = await page.waitForSelector(
    `xpath=//div[@class='lh-audit-group lh-audit-group--diagnostics']/child::div[2]`,
    { timeout: locatorExplicitWait }
  );

  // Extract title
  const diagnosticTitle = await page.waitForSelector(
    `xpath=//div[@class='lh-audit-group lh-audit-group--diagnostics']/child::div[2]/descendant::span[not(@class)][1]`,
    { timeout: locatorExplicitWait }
  );
  if (diagnosticTitle) {
    diagnosticTitleTxt = (await diagnosticTitle.textContent()) ?? '';
  }

  // Extract display text
  const diagnosticDisplay = await page.waitForSelector(
    `xpath=//div[@class='lh-audit-group lh-audit-group--diagnostics']/child::div[2]/descendant::span[@class='lh-audit__display-text']`,
    { timeout: locatorExplicitWait, state: 'attached' }
  );
  const tempText = await diagnosticDisplay?.textContent();
  diagnosticDisplayTxt = tempText?.trim() || '';

  // Extract redirect link
  const redirect = await page.waitForSelector(
    `xpath=//div[@class='lh-audit-group lh-audit-group--diagnostics']/child::div[2]/descendant::a[contains(text(), 'Learn')]`,
    { timeout: locatorExplicitWait }
  );
  if (redirect) {
    diagnosticRedirectTxt = (await redirect.textContent()) ?? '';
    diagnosticRedirectLinkTxt = (await redirect.getAttribute('href')) ?? '';
  }

  // Take screenshot if needed
  if (diagnosticsBlock && shouldTakeScreenshot(device, isIncognito, screenshotOption)) {
    await diagnosticsBlock.screenshot({ path: diagnosticScreenshotPath });
    console.log(`\n📸 Diagnostic Screenshot saved: ${diagScreenshotFile}`);

  } else if (!shouldTakeScreenshot(device, isIncognito, screenshotOption)) {
    diagnosticScreenshotPath = "skipped";

  } else {
    console.warn('\n⚠️ Diagnostics block not found.');
  }

  return { diagnosticTitleTxt, diagnosticDisplayTxt, diagnosticRedirectTxt, diagnosticRedirectLinkTxt, diagnosticScreenshotPath };
}

async function getAuditsData(
  page: Page,
  device: DeviceType,
  isIncognito: boolean,
  screenshotOption: number,
  auditScreenshotPath: string,
  auditScreenshotFile: string,
  label: string,
  url: string
): Promise<{
  auditTitleTxt: string,
  auditRedirectTxt: string,
  auditRedirectLinkTxt: string,
  auditScreenshotPath: string
}> {
  let auditTitleTxt = '';
  let auditRedirectTxt = '';
  let auditRedirectLinkTxt = '';

  // Click "Show passed audits" button
  const showAuditsLocator = `(//div[@class="lh-audit-group"]/details[@class="lh-clump lh-clump--passed"])[1]`;
  const toggleAudits = await page.waitForSelector(
    `xpath=${showAuditsLocator}`,
    { timeout: locatorExplicitWait }
  );
  if (toggleAudits) await page.$eval(showAuditsLocator, el => el.setAttribute('open', ''));

  // Click Audit Block dropdown
  const auditBlockDropdownLocator = `(//div[@class='lh-audit lh-audit--metricsavings lh-audit--pass'])[1]/descendant::div[1]`;
  const toggleAuditBlockDropdown = await page.waitForSelector(
    `xpath=${auditBlockDropdownLocator}`,
    { timeout: locatorExplicitWait }
  );
  if (toggleAuditBlockDropdown) await toggleAuditBlockDropdown.click();
  
  // Audit Block for screenshot
  const auditBlockLocator = `(//div[@class='lh-audit lh-audit--metricsavings lh-audit--pass'])[1]`;
  const auditBlock = await page.waitForSelector(
    `xpath=${auditBlockLocator}`,
    { timeout: locatorExplicitWait }
  );

  // Extract audit title
  const auditTitle = await page.waitForSelector(
    `xpath=(//div[@class='lh-audit lh-audit--metricsavings lh-audit--pass']/descendant::span[not(@class)])[1]`,
    { timeout: locatorExplicitWait }
  );
  if (auditTitle) auditTitleTxt = (await auditTitle.textContent()) ?? '';0

  // Extract redirect link and text
  const redirect = await page.waitForSelector(
    `xpath=(//div[@class='lh-audit lh-audit--metricsavings lh-audit--pass']/descendant::a[contains(text(), 'Learn')])[1]`,
    { timeout: locatorExplicitWait }
  );
  if (redirect) {
    auditRedirectTxt = (await redirect.textContent()) ?? '';
    auditRedirectLinkTxt = (await redirect.getAttribute('href')) ?? '';
  }

  // Take screenshot if needed
  if (auditBlock && shouldTakeScreenshot(device, isIncognito, screenshotOption)) {
    await auditBlock.screenshot({ path: auditScreenshotPath });
    console.log(`\n📸 Audit Screenshot saved: ${auditScreenshotFile}`);

  } else if (!shouldTakeScreenshot(device, isIncognito, screenshotOption)) {
    auditScreenshotPath = "skipped";

  } else {
    console.warn('\n⚠️ Audit block not found.');
  }

  return { auditTitleTxt, auditRedirectTxt, auditRedirectLinkTxt, auditScreenshotPath };
}