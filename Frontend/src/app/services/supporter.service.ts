import { Injectable, signal } from '@angular/core';
import { Browser } from '@capacitor/browser';

/**
 * Opens the donation page in the native system browser (via Capacitor) rather
 * than an in-app WebView. Keeping the transaction entirely outside the app is
 * what keeps donations out of Apple's In-App Purchase requirement — the tip is
 * a charitable contribution processed by an external provider, not digital
 * content unlocked inside the app.
 */
@Injectable({ providedIn: 'root' })
export class SupporterService {
  /** TODO: replace with the project's real Ko-fi handle before release. */
  private readonly donationUrl = 'https://ko-fi.com/YOUR_ACCOUNT';

  /** True while the external browser is being opened (for button state). */
  readonly opening = signal(false);

  async openDonationPage(): Promise<void> {
    this.opening.set(true);
    try {
      await Browser.open({ url: this.donationUrl, presentationStyle: 'popover' });
    } catch (err) {
      // User cancelled, or the browser could not be opened — never crash the app.
      console.warn('Could not open donation page:', err);
    } finally {
      this.opening.set(false);
    }
  }
}
