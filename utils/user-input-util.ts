import readline from 'readline';

export type DeviceType = 'Mobile' | 'Desktop';

export async function askScreenshotOption(): Promise<number> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n📸 Select Screenshot Capture Option');
  console.log('Please choose which Lighthouse runs should include screenshots:');
  console.log(' 1. Mobile - Normal Mode');
  console.log(' 2. Mobile - Incognito Mode');
  console.log(' 3. Desktop - Normal Mode');
  console.log(' 4. Desktop - Incognito Mode');
  console.log(' 5. All Mobile Modes (Normal + Incognito)');
  console.log(' 6. All Desktop Modes (Normal + Incognito)');
  console.log(' 7. All Normal Mode (Mobile + Desktop)');
  console.log(' 8. All Incognito Mode (Mobile + Desktop)');
  console.log(' 9. All Combinations (Capture everything)');
  console.log(' 10. No screenshot\n');

  return new Promise<number>((resolve) => {
    rl.question('Enter your choice (1–10): ', (answer) => {
      rl.close();
      const choice = parseInt(answer, 10);
      if (isNaN(choice) || choice < 1 || choice > 10) {
        console.log('\n❌ Invalid choice. Defaulting to 1...');
        // process.exit(1);
        resolve(1);
      } else {
        console.log('\n❌ Other options are not yet implemented. Defaulting to 1...');
        resolve(1);
      }
    });
  });
}

export function shouldTakeScreenshot(
  device: DeviceType,
  isIncognito: boolean,
  option: number
): boolean {
  switch (option) {
    case 1: return device === 'Mobile' && !isIncognito;
    case 2: return device === 'Mobile' && isIncognito;
    case 3: return device === 'Desktop' && !isIncognito;
    case 4: return device === 'Desktop' && isIncognito;
    case 5: return device === 'Mobile';
    case 6: return device === 'Desktop';
    case 7: return !isIncognito;
    case 8: return isIncognito;
    case 9: return true;
    default: return false;
  }
}
