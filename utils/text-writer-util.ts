import fs from 'fs';

export function textWriterUtil(
  logPath: string,
  logTimestamp: string,
  url: string,
  label: string,
  performanceScore: number,
  diagnosticTitleTxt: string,
  diagnosticDisplayTxt: string,
  diagnosticRedirectTxt: string,
  diagnosticRedirectLinkTxt: string,
  diagnosticScreenshotPath: string,
  auditTitleTxt: string,
  auditRedirectTxt: string,
  auditRedirectLinkTxt: string,
  auditScreenshotPath: string,
  htmlReportFile: string,
  outputDir: string
) {
  fs.appendFileSync(logPath, `\n[${logTimestamp}] ${url} - ${label}:`+
    `\nScore: ${performanceScore}`+
    `\nTime: ${logTimestamp}`+
    `\nDiagnostic Title Text: ${diagnosticTitleTxt}` +
    `\nDiagnostic Display Text: ${diagnosticDisplayTxt}`+
    `\nDiagnostic Redirect Text: ${diagnosticRedirectTxt}`+
    `\nDiagnostic Redirect Link Text: ${diagnosticRedirectLinkTxt}`+
    `\nDiagnostic Screenshot Path: ${diagnosticScreenshotPath}`+
    `\nAudit Title Text: ${auditTitleTxt}` +
    `\nAudit Redirect Text: ${auditRedirectTxt}`+
    `\nAudit Redirect Link Text: ${auditRedirectLinkTxt}`+
    `\nAudit Screenshot Path: ${auditScreenshotPath}`+
    `\nHtml Report Path: ${htmlReportFile}.report.html`+
    `\nOutput Report Path: ${outputDir}\n`
  );
}