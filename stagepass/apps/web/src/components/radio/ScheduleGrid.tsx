"use client";

import { ScheduleSlot, DAY_SHORT, DAY_NAMES, formatTime, getUpcomingShows, getActiveScheduleSlot } from "@/lib/radio/scheduler";
import { Clock, Radio, Zap } from "lucide-react";

interface ScheduleGridProps {
  schedule: ScheduleSlot[];
  stationName: string;
}

export default function ScheduleGrid({ schedule, stationName }: ScheduleGridProps) {
  const activeSlot = getActiveScheduleSlot(schedule);
  const upcoming = getUpcomingShows(schedule, 5);

  if (!schedule.length) {
    return (
      <div className="text-center py-6 text-sm text-stage-mutetext">
        <Zap size={20} className="mx-auto mb-2 text-stage-mint" />
        Auto-DJ is running 24/7
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="schedule-grid">
      {/* Currently Live */}
      {activeSlot && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse shrink-0" />
          <div>
            <p className="font-bold text-white text-sm">LIVE NOW: {activeSlot.showName}</p>
            <p className="text-xs text-stage-mutetext">
              {DAY_NAMES[activeSlot.dayOfWeek]} {formatTime(activeSlot.startHour, activeSlot.startMinute)} — {formatTime(activeSlot.endHour, activeSlot.endMinute)}
            </p>
          </div>
        </div>
      )}

      {!activeSlot && (
        <div className="bg-stage-mint/5 border border-stage-mint/20 rounded-xl p-4 flex items-center gap-3">
          <Zap size={16} className="text-stage-mint shrink-0" />
          <div>
            <p className="font-bold text-white text-sm">Auto-DJ Active</p>
            <p className="text-xs text-stage-mutetext">Playing tracks from {stationName}'s playlist</p>
          </div>
        </div>
      )}

      {/* Weekly Grid */}
      <div className="grid grid-cols-7 gap-1 text-center" data-testid="schedule-week-grid">
        {DAY_SHORT.map((day, i) => (
          <div key={day} className="text-xs font-bold text-stage-mutetext py-1">{day}</div>
        ))}
        {DAY_SHORT.map((_, dayIdx) => {
          const daySlots = schedule.filter((s) => s.dayOfWeek === dayIdx);
          return (
            <div key={dayIdx} className="min-h-[60px] bg-black/20 rounded-lg p-1 space-y-1">
              {daySlots.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-stage-indigo/30 border border-stage-indigo/50 rounded px-1 py-0.5 text-[10px] text-white truncate"
                  title={`${slot.showName}: ${formatTime(slot.startHour, slot.startMinute)}-${formatTime(slot.endHour, slot.endMinute)}`}
                >
                  {formatTime(slot.startHour, slot.startMinute).replace(" ", "")}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Upcoming Shows */}
      {upcoming.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-stage-mutetext uppercase tracking-wider mb-2">Upcoming</h4>
          <div className="space-y-1.5">
            {upcoming.map((slot) => (
              <div key={slot.id} className="flex items-center gap-2 text-xs">
                <Clock size={12} className="text-stage-mutetext shrink-0" />
                <span className="text-white font-medium">{slot.showName || "Untitled"}</span>
                <span className="text-stage-mutetext">
                  {DAY_SHORT[slot.dayOfWeek]} {formatTime(slot.startHour, slot.startMinute)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
