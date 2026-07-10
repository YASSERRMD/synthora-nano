const BACKUP_REMINDER_KEY = "synthora-backup-reminder";
const DEFAULT_INTERVAL_DAYS = 7;

export interface BackupReminder {
  lastBackupAt: string;
  nextReminderAt: string;
  intervalDays: number;
}

export function getBackupReminder(): BackupReminder | null {
  try {
    const stored = localStorage.getItem(BACKUP_REMINDER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function setBackupReminder(
  intervalDays: number = DEFAULT_INTERVAL_DAYS,
): BackupReminder {
  const now = new Date();
  const nextReminder = new Date(
    now.getTime() + intervalDays * 24 * 60 * 60 * 1000,
  );

  const reminder: BackupReminder = {
    lastBackupAt: now.toISOString(),
    nextReminderAt: nextReminder.toISOString(),
    intervalDays,
  };

  try {
    localStorage.setItem(BACKUP_REMINDER_KEY, JSON.stringify(reminder));
  } catch {
    // Storage full
  }

  return reminder;
}

export function shouldRemindBackup(): boolean {
  const reminder = getBackupReminder();
  if (!reminder) return true;

  const now = new Date();
  return now >= new Date(reminder.nextReminderAt);
}

export function getDaysSinceLastBackup(): number | null {
  const reminder = getBackupReminder();
  if (!reminder) return null;

  const lastBackup = new Date(reminder.lastBackupAt);
  const now = new Date();
  return Math.floor(
    (now.getTime() - lastBackup.getTime()) / (24 * 60 * 60 * 1000),
  );
}
