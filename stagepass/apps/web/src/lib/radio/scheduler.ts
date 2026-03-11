export interface Track {
  id: string;
  title: string;
  durationMs: number; // Defaults to 180000 (3 mins) if unknown
  url: string;
}

export interface StationState {
  track: Track;
  startTime: number; // When this track started playing
  offsetMs: number; // How far into the track we are
}

export function getNowPlaying(tracks: Track[]): StationState | null {
  if (!tracks.length) return null;

  const totalDuration = tracks.reduce((acc, t) => acc + (t.durationMs || 180000), 0);
  if (totalDuration === 0) return null;

  // Calculate position in the infinite loop based on current time
  // Using a fixed epoch (Start of 2026) ensures consistent sync across users
  const epoch = new Date("2026-01-01T00:00:00Z").getTime();
  const now = Date.now();
  const elapsed = now - epoch;
  
  let loopPosition = elapsed % totalDuration;
  
  // Find which track covers this position
  let currentTrack = tracks[0];
  let trackStartInLoop = 0;

  for (const track of tracks) {
    const duration = track.durationMs || 180000;
    if (loopPosition < duration) {
      currentTrack = track;
      break;
    }
    loopPosition -= duration;
    trackStartInLoop += duration;
  }

  return {
    track: currentTrack,
    startTime: now - loopPosition,
    offsetMs: loopPosition
  };
}
