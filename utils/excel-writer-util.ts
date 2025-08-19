import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';
import { readFile } from 'fs/promises';
import { pathToFileURL } from 'url';
import { imageSize } from 'image-size';
import { LIGHTHOUSE_STR, OUTPUT_FOLDER_TIMESTAMP, EXCEL_TEMPLATE_PATH } from '@config/lighthouse.config';

export function prepareExcelCopy(outputDir: string): string {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFileName = `CheQ_Website_Production_LighthouseInsights_${OUTPUT_FOLDER_TIMESTAMP}.xlsx`;
  const excelPath = path.join(outputDir, outputFileName);

  fs.copyFileSync(EXCEL_TEMPLATE_PATH, excelPath);
  return excelPath;
}

interface LighthouseRunData {
  logTimestamp: string;
  url: string;
  label: string;
  performanceScore: number;
  diagTitleTxt: string;
  diagDisplayTxt: string;
  diagRedirectTxt: string;
  diagRedirectLinkTxt: string;
  diagScreenshotPathTxt: string;
  auditTitleTxt: string;
  auditRedirectTxt: string;
  auditRedirectLinkTxt: string;
  auditScreenshotPathTxt: string;
  htmlReportPathTxt: string;
  outputReportPathTxt: string;
}

async function parseTxtLogFile(filePath: string): Promise<LighthouseRunData[]> {
  const content: string = await readFile(filePath, 'utf-8');
  const blocks: string[] = content.trim().split('\n\n');

  const data: LighthouseRunData[] = blocks.map(block => {
    const lines = block.split('\n');

    const timestampMatch =              lines[0].match(/^\[(.+?)\] (.+?) - (.+):$/);
    const scoreMatch =                  lines[1]?.match(/Score: (\d+)/);
    const diagTitleMatch =              lines[3]?.match(/Diagnostic Title Text: (.+)/);
    const diagDisplayMatch =            lines[4]?.match(/Diagnostic Display Text: (.+)/);
    const diagRedirectTextMatch =       lines[5]?.match(/Diagnostic Redirect Text: (.+)/);
    const diagRedirectLinkTextMatch =   lines[6]?.match(/Diagnostic Redirect Link Text: (.+)/);
    const diagScreenshotMatch =         lines[7]?.match(/Diagnostic Screenshot Path: (.+)/);
    const auditTitleTextMatch =         lines[8]?.match(/Audit Title Text: (.+)/);
    const auditRedirectTextMatch =      lines[9]?.match(/Audit Redirect Text: (.+)/);
    const auditRedirectLinkTextMatch =  lines[10]?.match(/Audit Redirect Link Text: (.+)/);
    const auditScreenshotMatch =        lines[11]?.match(/Audit Screenshot Path: (.+)/);
    const htmlReportPathTxMatch =       lines[12]?.match(/Html Report Path: (.+)/);
    const outputReportPathTxMatch =     lines[13]?.match(/Output Report Path: (.+)/);

    return {
      logTimestamp: timestampMatch?.[1] ?? '',
      url: timestampMatch?.[2] ?? '',
      label: timestampMatch?.[3] ?? '',
      performanceScore: parseInt(scoreMatch?.[1] ?? '0'),
      diagTitleTxt: diagTitleMatch?.[1] ?? '',
      diagDisplayTxt: diagDisplayMatch?.[1] ?? '',
      diagRedirectTxt: diagRedirectTextMatch?.[1] ?? '',
      diagRedirectLinkTxt: diagRedirectLinkTextMatch?.[1] ?? '',
      diagScreenshotPathTxt: diagScreenshotMatch?.[1] ?? '',
      auditTitleTxt: auditTitleTextMatch?.[1] ?? '',
      auditRedirectTxt: auditRedirectTextMatch?.[1] ?? '',
      auditRedirectLinkTxt: auditRedirectLinkTextMatch?.[1] ?? '',
      auditScreenshotPathTxt: auditScreenshotMatch?.[1] ?? '',
      htmlReportPathTxt: htmlReportPathTxMatch?.[1] ?? '',
      outputReportPathTxt: outputReportPathTxMatch?.[1] ?? '',
    };
  });

  return data;
}

export async function writeAllToExcel(
  txtPath: string,
  excelPath: string
) {
  const data = await parseTxtLogFile(txtPath);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);
  const summarySheet = workbook.worksheets[0];

  data.forEach((entry, i) => {
    const label = entry.label;
    const url = entry.url;

    // Determine column based on label
    const column = label.includes("Incognito") ? 'E' : 'D';

    // Mapping of URL substrings to row numbers for Desktop and Mobile
    const urls: Record<string, { Desktop: number; Mobile: number, Sheet: number }> = {
      "testing-services": { Desktop: 11, Mobile: 12, Sheet: 2 },
      "about":            { Desktop: 15, Mobile: 16, Sheet: 3 },
      "news":             { Desktop: 19, Mobile: 20, Sheet: 4 },
      "careers":          { Desktop: 23, Mobile: 24, Sheet: 5 },
      "contact":          { Desktop: 27, Mobile: 28, Sheet: 6 },
      "privacy-policy":   { Desktop: 31, Mobile: 32, Sheet: 7 },
      "game-testing":     { Desktop: 35, Mobile: 36, Sheet: 8 },
    };

    let row: number | undefined;
    let timelogRow: number | undefined;
    let sheet: number | undefined;
    
    for (const key in urls) {
      if (url.includes(key)) {
        const isMobile = label.includes("Mobile");
        const device = isMobile ? "Mobile" : "Desktop";
        
        row = urls[key][device];
        timelogRow = row - (isMobile ? 2 : 1);
        
        sheet = urls[key]["Sheet"];
        
        break;
      }
    }
    
    // Fallback rows if no match
    if (!row) {
      const isMobile = label.includes("Mobile");
      row = isMobile ? 8 : 7;
      timelogRow = isMobile ? 6 : 6; // Adjust here if needed
    }
    
    // Assign values to the worksheet
    if (timelogRow! > 0) summarySheet.getCell(`${column}${timelogRow}`).value = entry.logTimestamp;
    summarySheet.getCell(`${column}${row}`).value = entry.performanceScore;
    
    // Fallback if no match for sheet
    if (!sheet) sheet = 1;
    const otherSheet = workbook.worksheets[sheet];
    
    if (label.includes("Mobile") && label.includes("Normal")){

      if (entry.diagTitleTxt) setOtherSheetsData(otherSheet, entry.diagDisplayTxt, entry.diagTitleTxt, entry.diagRedirectTxt, entry.diagRedirectLinkTxt, false);
      if (entry.auditTitleTxt) setOtherSheetsData(otherSheet, '', entry.auditTitleTxt, entry.auditRedirectTxt, entry.auditRedirectLinkTxt, true);
      
      // Add screenshots in excel
      if (fs.existsSync(entry.diagScreenshotPathTxt)) setImage(workbook, otherSheet, entry.diagScreenshotPathTxt, false);
      if (fs.existsSync(entry.auditScreenshotPathTxt)) setImage(workbook, otherSheet, entry.auditScreenshotPathTxt, true);
    }
    
    const filePaths: Record<string, { Normal: number, Incognito: number }> = {
      "Desktop": { Normal: 3, Incognito: 4 },
      "Mobile": { Normal: 5, Incognito: 6 },
    };
    
    const device = label.includes("Mobile") ? "Mobile" : "Desktop";
    const mode = label.includes("Normal") ? "Normal" : "Incognito";
    
    const linkRow = filePaths[device][mode]; 
    
    const fullPath = path.join(entry.outputReportPathTxt, `html-${OUTPUT_FOLDER_TIMESTAMP}`, entry.htmlReportPathTxt);
    
    // Check file exists (helps debugging if Excel says it can't open)
    if (!fs.existsSync(fullPath)) {
      console.warn('HTML report does not exist:', fullPath);
    } else {
      // Convert to a proper file:// URL and ensure forward-slashes + encoding
      const fileUrl = pathToFileURL(fullPath).toString(); // e.g. "file:///C:/Users/…/html/filename.report.html"
      
      otherSheet.getCell(`E${linkRow}`).value = {
        formula: `HYPERLINK(".\\html-${OUTPUT_FOLDER_TIMESTAMP}\\${entry.htmlReportPathTxt}", "${url} — ${label}")`
      };
    }
  });

  await workbook.xlsx.writeFile(excelPath);
}

// Adding image function
async function setImage(
  workbook: ExcelJS.Workbook,
  otherSheet: ExcelJS.Worksheet,
  screenshotPathTxt: string,
  isAudit: Boolean,
){
    const imageId = workbook.addImage({
    filename: screenshotPathTxt,
    extension: 'png',
  });
  
  // Screenshot size
  const imageBuffer = fs.readFileSync(screenshotPathTxt); // returns Buffer
  const dimensions = imageSize(imageBuffer); // returns { width, height }
  if (!dimensions.width || !dimensions.height) throw new Error("Invalid image");

  // Desired image width in pixels
  const targetWidth = 935;
  const scale = targetWidth / dimensions.width;
  const scaledHeight = dimensions.height * scale;

  let row: number;
  // row: 12, row: 28 (zero-based)
  isAudit ? row = 12 : row = 28;

  // Insert diagnostic screenshot to designated sheet
  otherSheet.addImage(imageId, {
    // C29 = col: 2 (C)
    tl: { col: 2, row: row }, 
    ext: { width: targetWidth, height: scaledHeight },
  });
}

// Adding data function
async function setOtherSheetsData(
  otherSheet: ExcelJS.Worksheet,
  displayTxt: string,
  titleTxt: string,
  redirectTxt: string,
  redirectLinkTxt: string,
  isAudit: Boolean,
){
  const displayTxtFilter = displayTxt ? `— ${displayTxt}` : '';

  let row: number;
  isAudit ? row = 10 : row = 26;
  
  // Directly inserting the link is 1-based
  otherSheet.getCell(`C${row}`).value = `${titleTxt} ${displayTxtFilter} `;
  otherSheet.getCell(`C${row + 1}`).value = {
    text: redirectTxt,
    hyperlink: redirectLinkTxt
  };

}