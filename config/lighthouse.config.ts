import testUrls from '@data/test-url.json';

export const SINGLE_TEST_URL: string[] = [testUrls.SingleLighthouse.url];
export const ALL_TEST_URLS = Object.values(testUrls.AllLighthouse);

// Folder Format Timestamp
export const folderTimestamp = new Date().toLocaleString('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
})
  .replace(/[/, ]/g, '-')
  .replace(/:/g, '-')
  .replace('--', '-')
  .toUpperCase();

// Report Format Timestamp
export function reportTimestamp(fetchTime: string): string {
  return new Date(fetchTime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

// Lighthouse Chrome Flags
export function getChromeFlags(isIncognito: boolean): string {
  return [
    '--headless=new',
    isIncognito ? '--incognito' : ''
  ].filter(Boolean).join(' ');
}

// Lighthouse Device Preset
export function getLighthousePreset(device: 'Mobile' | 'Desktop'): string {
  return device === 'Desktop' ? '--preset=desktop' : '';
}