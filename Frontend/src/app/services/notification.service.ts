import { Injectable, signal } from '@angular/core';
import { QuestionOfTheDay } from './civics-api.service';

const LS_ENABLED = 'cf-notif-enabled';
const LS_TIME = 'cf-notif-time';
const LS_LAST_FIRED = 'cf-notif-last-fired'; // yyyy-MM-dd of last shown reminder

/**
 * Browser-native daily reminder using the Web Notifications API.
 *
 * A precise OS-level daily push requires a push server + VAPID, which is out
 * of scope for a static-hostable SPA. Instead this schedules an in-app timer
 * that fires while the tab is open, de-duplicated per calendar day via
 * localStorage so reopening the app doesn't re-notify.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly isSupported =
    signal<boolean>(typeof window !== 'undefined' && 'Notification' in window);

  readonly permissionGranted = signal<boolean>(
    this.isSupported() && Notification.permission === 'granted'
  );

  readonly dailyNotificationEnabled = signal<boolean>(this.readEnabled());
  readonly scheduledTime = signal<string>(this.readTime());

  private timer: ReturnType<typeof setTimeout> | null = null;
  private latestQotd: QuestionOfTheDay | null = null;

  /** Prompt for permission; returns whether it was granted. */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    if (Notification.permission === 'granted') {
      this.permissionGranted.set(true);
      return true;
    }
    if (Notification.permission === 'denied') {
      this.permissionGranted.set(false);
      return false;
    }
    try {
      const result = await Notification.requestPermission();
      const granted = result === 'granted';
      this.permissionGranted.set(granted);
      return granted;
    } catch {
      this.permissionGranted.set(false);
      return false;
    }
  }

  /**
   * Persist the daily reminder preference and (re)arm the in-app timer for the
   * next occurrence of `time` (HH:MM). Requires an already-granted permission.
   */
  scheduleDailyReminder(time: string, qotd: QuestionOfTheDay): void {
    this.latestQotd = qotd;
    this.scheduledTime.set(time);
    this.dailyNotificationEnabled.set(true);
    this.writePref(true, time);
    this.arm();
  }

  /** Turn off the daily reminder and clear the pending timer. */
  cancelDailyReminder(): void {
    this.dailyNotificationEnabled.set(false);
    this.writePref(false, this.scheduledTime());
    this.clearTimer();
  }

  /** Update the stored QOTD so a pending reminder shows today's question. */
  updateQotd(qotd: QuestionOfTheDay): void {
    this.latestQotd = qotd;
    if (this.dailyNotificationEnabled() && this.timer === null) this.arm();
  }

  /** Fire a notification right now (test button). */
  sendImmediateNotification(qotd: QuestionOfTheDay): void {
    this.show(qotd);
  }

  /** Re-arm on app boot if the user had previously enabled reminders. */
  restoreOnBoot(qotd: QuestionOfTheDay): void {
    this.latestQotd = qotd;
    this.permissionGranted.set(
      this.isSupported() && Notification.permission === 'granted'
    );
    if (this.dailyNotificationEnabled() && this.permissionGranted()) {
      this.arm();
    }
  }

  // ── internals ──────────────────────────────────────────────────────────────

  private arm(): void {
    this.clearTimer();
    if (!this.permissionGranted()) return;

    const delay = this.msUntilNext(this.scheduledTime());
    this.timer = setTimeout(() => {
      const today = this.todayKey();
      if (this.readLastFired() !== today && this.latestQotd) {
        this.show(this.latestQotd);
        this.writeLastFired(today);
      }
      this.arm(); // schedule tomorrow
    }, delay);
  }

  private show(qotd: QuestionOfTheDay): void {
    if (!this.permissionGranted()) return;
    try {
      new Notification('🇺🇸 Civics Question of the Day', {
        body: `Q: ${qotd.questionText}\nTap to check the official answer!`,
        tag: 'cf-qotd',
        icon: '/favicon.ico',
      });
    } catch { /* ignore — some browsers require SW-based notifications */ }
  }

  /** Milliseconds from now until the next HH:MM occurrence (today or tomorrow). */
  private msUntilNext(time: string): number {
    const [h, m] = time.split(':').map(Number);
    const now = new Date();
    const target = new Date(now);
    target.setHours(h || 0, m || 0, 0, 0);
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target.getTime() - now.getTime();
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private todayKey(): string {
    return new Date().toISOString().slice(0, 10);
  }

  // ── localStorage helpers ─────────────────────────────────────────────────────

  private readEnabled(): boolean {
    try { return localStorage.getItem(LS_ENABLED) === 'true'; } catch { return false; }
  }
  private readTime(): string {
    try { return localStorage.getItem(LS_TIME) || '09:00'; } catch { return '09:00'; }
  }
  private readLastFired(): string {
    try { return localStorage.getItem(LS_LAST_FIRED) || ''; } catch { return ''; }
  }
  private writeLastFired(day: string): void {
    try { localStorage.setItem(LS_LAST_FIRED, day); } catch { /* ignore */ }
  }
  private writePref(enabled: boolean, time: string): void {
    try {
      localStorage.setItem(LS_ENABLED, String(enabled));
      localStorage.setItem(LS_TIME, time);
    } catch { /* ignore */ }
  }
}
