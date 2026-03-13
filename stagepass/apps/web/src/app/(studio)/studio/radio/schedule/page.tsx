"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Calendar, Clock, Plus, Trash2, Save, CheckCircle, Shuffle, Layers, Music2 } from "lucide-react";
import { ScheduleSlot, DAY_NAMES, formatTime } from "@/lib/radio/scheduler";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 30];
const MOODS = ["Chill", "Hype", "Deep", "Smooth", "Energy"] as const;
const MOOD_COLORS: Record<string, string> = {
  Chill: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Hype: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Deep: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Smooth: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Energy: "bg-red-500/20 text-red-300 border-red-500/30",
};

function generateId() {
  return `slot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function ScheduleEditor() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [autoDjEnabled, setAutoDjEnabled] = useState(true);
  const [autoDjShuffle, setAutoDjShuffle] = useState(false);
  const [crossfadeEnabled, setCrossfadeEnabled] = useState(false);
  const [crossfadeDuration, setCrossfadeDuration] = useState(3);
  const [moodFilter, setMoodFilter] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/radio/schedule?stationId=${user.uid}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setSchedule(data.schedule || []);
          setAutoDjEnabled(data.autoDj?.enabled !== false);
          setAutoDjShuffle(data.autoDj?.shuffle || false);
          setCrossfadeEnabled(data.autoDj?.crossfadeEnabled ?? false);
          setCrossfadeDuration(data.autoDj?.crossfadeDuration ?? 3);
          setMoodFilter(data.autoDj?.moodFilter ?? []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const addSlot = () => {
    setSchedule((prev) => [
      ...prev,
      {
        id: generateId(),
        dayOfWeek: 1,
        startHour: 20,
        startMinute: 0,
        endHour: 22,
        endMinute: 0,
        showName: "",
      },
    ]);
  };

  const updateSlot = (id: string, field: string, value: any) => {
    setSchedule((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const removeSlot = (id: string) => {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/radio/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          stationId: user.uid,
          userId: user.uid,
          schedule,
          autoDjEnabled,
          autoDjShuffle,
          crossfadeEnabled,
          crossfadeDuration,
          moodFilter,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <div className="h-10 w-10 mx-auto border-2 border-white/20 border-t-stage-mint rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="schedule-heading">
          <Calendar className="text-stage-mint" />
          Show Schedule
        </h1>
        <p className="text-stage-mutetext">
          Set your weekly broadcast schedule. When no show is scheduled, Auto-DJ fills in.
        </p>
      </div>

      {/* Auto-DJ Settings */}
      <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-lg border-b border-white/10 pb-2">Auto-DJ Settings</h3>
        <p className="text-sm text-stage-mutetext">
          Auto-DJ plays your uploaded tracks automatically when no scheduled show is live.
        </p>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={autoDjEnabled} onChange={(e) => setAutoDjEnabled(e.target.checked)}
              className="h-5 w-5 rounded border-white/20 bg-stage-bg text-stage-mint focus:ring-stage-mint accent-[#00FFC6]"
              data-testid="autodj-enabled" />
            <span className="text-sm font-medium">Enable Auto-DJ</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={autoDjShuffle} onChange={(e) => setAutoDjShuffle(e.target.checked)}
              className="h-5 w-5 rounded border-white/20 bg-stage-bg text-stage-mint focus:ring-stage-mint accent-[#00FFC6]"
              data-testid="autodj-shuffle" />
            <Shuffle size={16} className="text-stage-mutetext" />
            <span className="text-sm font-medium">Shuffle Mode</span>
          </label>
        </div>

        {/* Crossfade Settings */}
        <div className="border-t border-white/10 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-stage-mint" />
              <span className="text-sm font-medium">Crossfade Transitions</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={crossfadeEnabled} onChange={e => setCrossfadeEnabled(e.target.checked)}
                className="sr-only peer" data-testid="crossfade-toggle" />
              <div className="w-10 h-5 bg-white/10 rounded-full peer peer-checked:bg-stage-mint transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>
          {crossfadeEnabled && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stage-mutetext">Fade Duration</span>
                <span className="text-stage-mint font-bold">{crossfadeDuration}s</span>
              </div>
              <input type="range" min={1} max={8} step={1} value={crossfadeDuration}
                onChange={e => setCrossfadeDuration(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-[#00FFC6] cursor-pointer"
                data-testid="crossfade-duration" />
              <div className="flex justify-between text-xs text-stage-mutetext">
                <span>1s (quick cut)</span><span>4s (smooth)</span><span>8s (slow blend)</span>
              </div>
            </div>
          )}
        </div>

        {/* Mood Filter */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Music2 size={16} className="text-stage-mint" />
            <span className="text-sm font-medium">Mood Filter</span>
            <span className="text-xs text-stage-mutetext ml-1">(empty = play all tracks)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {MOODS.map(mood => {
              const active = moodFilter.includes(mood);
              return (
                <button key={mood} data-testid={`mood-filter-${mood.toLowerCase()}`}
                  onClick={() => setMoodFilter(prev => active ? prev.filter(m => m !== mood) : [...prev, mood])}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${active ? MOOD_COLORS[mood] : "bg-white/5 text-stage-mutetext border-white/10 hover:bg-white/10"}`}>
                  {mood}
                </button>
              );
            })}
          </div>
          {moodFilter.length > 0 && (
            <p className="text-xs text-stage-mutetext">Only tracks tagged <strong className="text-white">{moodFilter.join(", ")}</strong> will play in Auto-DJ mode.</p>
          )}
        </div>
      </div>

      {/* Schedule Slots */}
      <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h3 className="font-bold text-lg">Weekly Schedule</h3>
          <Button variant="secondary" size="sm" onClick={addSlot} data-testid="add-slot-btn">
            <Plus size={14} className="mr-1" /> Add Time Slot
          </Button>
        </div>

        {schedule.length === 0 ? (
          <div className="text-center py-8 text-stage-mutetext">
            <Clock size={32} className="mx-auto mb-2 opacity-30" />
            <p>No shows scheduled yet. Auto-DJ will play 24/7.</p>
            <p className="text-xs mt-1">Click "Add Time Slot" to create your first show.</p>
          </div>
        ) : (
          <div className="space-y-4" data-testid="schedule-slots">
            {schedule.map((slot, idx) => (
              <div
                key={slot.id}
                className="bg-black/20 rounded-xl p-4 space-y-3"
                data-testid={`schedule-slot-${idx}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stage-mint uppercase tracking-wider">
                    Show #{idx + 1}
                  </span>
                  <button
                    onClick={() => removeSlot(slot.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    data-testid={`remove-slot-${idx}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-stage-mutetext mb-1">Show Name</label>
                  <Input
                    value={slot.showName}
                    onChange={(e) => updateSlot(slot.id, "showName", e.target.value)}
                    placeholder="e.g. Friday Night Vibes"
                    data-testid={`slot-name-${idx}`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-stage-mutetext mb-1">Day</label>
                    <select
                      className="w-full rounded-lg border border-white/10 bg-stage-bg px-2 py-2 text-sm text-white"
                      value={slot.dayOfWeek}
                      onChange={(e) => updateSlot(slot.id, "dayOfWeek", parseInt(e.target.value))}
                      data-testid={`slot-day-${idx}`}
                    >
                      {DAY_NAMES.map((name, i) => (
                        <option key={i} value={i}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-stage-mutetext mb-1">Start</label>
                    <select
                      className="w-full rounded-lg border border-white/10 bg-stage-bg px-2 py-2 text-sm text-white"
                      value={`${slot.startHour}:${slot.startMinute}`}
                      onChange={(e) => {
                        const [h, m] = e.target.value.split(":").map(Number);
                        updateSlot(slot.id, "startHour", h);
                        updateSlot(slot.id, "startMinute", m);
                      }}
                      data-testid={`slot-start-${idx}`}
                    >
                      {HOURS.flatMap((h) =>
                        MINUTES.map((m) => (
                          <option key={`${h}:${m}`} value={`${h}:${m}`}>
                            {formatTime(h, m)}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-stage-mutetext mb-1">End</label>
                    <select
                      className="w-full rounded-lg border border-white/10 bg-stage-bg px-2 py-2 text-sm text-white"
                      value={`${slot.endHour}:${slot.endMinute}`}
                      onChange={(e) => {
                        const [h, m] = e.target.value.split(":").map(Number);
                        updateSlot(slot.id, "endHour", h);
                        updateSlot(slot.id, "endMinute", m);
                      }}
                      data-testid={`slot-end-${idx}`}
                    >
                      {HOURS.flatMap((h) =>
                        MINUTES.map((m) => (
                          <option key={`${h}:${m}`} value={`${h}:${m}`}>
                            {formatTime(h, m)}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-stage-mutetext mb-1">Description (optional)</label>
                  <Input
                    value={slot.description || ""}
                    onChange={(e) => updateSlot(slot.id, "description", e.target.value)}
                    placeholder="What's this show about?"
                    data-testid={`slot-desc-${idx}`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex items-center justify-between">
        {saved && (
          <span className="text-stage-mint text-sm flex items-center gap-1">
            <CheckCircle size={14} /> Schedule saved!
          </span>
        )}
        <div className="ml-auto">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSave}
            disabled={saving}
            data-testid="schedule-save-btn"
          >
            {saving ? "Saving..." : <><Save size={16} className="mr-2" /> Save Schedule</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
