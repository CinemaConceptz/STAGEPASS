export interface Track {
  id: string;
  title: string;
  artist?: string;
  durationMs: number;
  url: string;
}

export interface ScheduleSlot {
  id: string;
  dayOfWeek: number; // 0=Sun, 1=Mon ... 6=Sat
  startHour: number; // 0-23
  startMinute: number; // 0 or 30
  endHour: number;
  endMinute: number;
  showName: string;
  description?: string;
  isLive?: boolean;
}

export interface StationState {
  track: Track;
  trackIndex: number;
  startTime: number;
  offsetMs: number;
  mode: "AUTO_DJ" | "SCHEDULED" | "LIVE";
  nextTrack?: Track;
}

// ─── Auto-DJ: get current track in infinite loop ────────────────────────────
export function getNowPlaying(tracks: Track[], shuffle?: boolean): StationState | null {
  if (!tracks.length) return null;

  const totalDuration = tracks.reduce((acc, t) => acc + (t.durationMs || 180000), 0);
  if (totalDuration === 0) return null;

  // Epoch sync ensures all listeners hear the same track at the same time
  const epoch = new Date("2026-01-01T00:00:00Z").getTime();
  const now = Date.now();
  const elapsed = now - epoch;

  // If shuffle, use a deterministic shuffle based on the day
  let orderedTracks = [...tracks];
  if (shuffle) {
    const daySeed = Math.floor(elapsed / 86400000);
    orderedTracks = deterministicShuffle(orderedTracks, daySeed);
  }

  let loopPosition = elapsed % totalDuration;
  let trackIndex = 0;

  for (let i = 0; i < orderedTracks.length; i++) {
    const duration = orderedTracks[i].durationMs || 180000;
    if (loopPosition < duration) {
      trackIndex = i;
      break;
    }
    loopPosition -= duration;
  }

  const nextIndex = (trackIndex + 1) % orderedTracks.length;

  return {
    track: orderedTracks[trackIndex],
    trackIndex,
    startTime: now - loopPosition,
    offsetMs: loopPosition,
    mode: "AUTO_DJ",
    nextTrack: orderedTracks[nextIndex],
  };
}

// ─── Check if a scheduled show is currently active ──────────────────────────
export function getActiveScheduleSlot(schedule: ScheduleSlot[]): ScheduleSlot | null {
  if (!schedule.length) return null;

  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const slot of schedule) {
    if (slot.dayOfWeek !== dayOfWeek) continue;
    const slotStart = slot.startHour * 60 + slot.startMinute;
    const slotEnd = slot.endHour * 60 + slot.endMinute;
    if (currentMinutes >= slotStart && currentMinutes < slotEnd) {
      return slot;
    }
  }
  return null;
}

// ─── Get upcoming shows for display ──────────────────────────────────────────
export function getUpcomingShows(schedule: ScheduleSlot[], count = 5): ScheduleSlot[] {
  if (!schedule.length) return [];

  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const withAbsoluteTime = schedule.map(slot => {
    let daysAhead = slot.dayOfWeek - dayOfWeek;
    if (daysAhead < 0) daysAhead += 7;
    const slotMinutes = slot.startHour * 60 + slot.startMinute;
    if (daysAhead === 0 && slotMinutes <= currentMinutes) daysAhead = 7;
    return { ...slot, _sortKey: daysAhead * 1440 + slotMinutes };
  });

  withAbsoluteTime.sort((a, b) => a._sortKey - b._sortKey);
  return withAbsoluteTime.slice(0, count);
}

// ─── Deterministic shuffle (same order for all listeners on same day) ────────
function deterministicShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─── Format helpers ──────────────────────────────────────────────────────────
export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatTime(hour: number, minute: number): string {
  const ampm = hour >= 12 ? "PM" : "AM";
  const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h}:${minute.toString().padStart(2, "0")} ${ampm}`;
}
