"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Users, Video, Radio, Activity, CheckCircle, XCircle, Clock } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalContent: number;
  totalStations: number;
  totalLiveSessions: number;
  recentContent: any[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "content" | "stations">("overview");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.error) setStats(data);
      } catch { /* silent */ }
      setLoading(false);
    };
    load();
  }, [user]);

  const updateContentStatus = async (id: string, status: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await fetch("/api/admin/stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ contentId: id, status }),
      });
      setStats(prev => prev ? {
        ...prev,
        recentContent: prev.recentContent.map(c => c.id === id ? { ...c, status } : c)
      } : prev);
    } catch { /* silent */ }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-white/20 border-t-stage-mint rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-stage-mutetext">STAGEPASS Platform Control Center</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-stage-mint" },
          { label: "Content Items", value: stats?.totalContent || 0, icon: Video, color: "text-stage-indigo" },
          { label: "Radio Stations", value: stats?.totalStations || 0, icon: Radio, color: "text-amber-400" },
          { label: "Live Sessions", value: stats?.totalLiveSessions || 0, icon: Activity, color: "text-red-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-stage-panel border border-white/10 rounded-2xl p-6 flex items-center gap-4">
            <Icon size={28} className={color} />
            <div>
              <p className="text-2xl font-black">{value}</p>
              <p className="text-xs text-stage-mutetext">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/10 text-sm font-medium text-stage-mutetext">
        {(["overview", "content", "stations"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 capitalize transition-colors ${tab === t ? "text-white border-b-2 border-stage-mint" : "hover:text-white"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <h2 className="font-bold text-lg">Recent Content</h2>
          <div className="bg-stage-panel border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-stage-mutetext text-xs uppercase tracking-widest">
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Creator</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Views</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentContent || []).map((item: any) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium truncate max-w-[200px]">{item.title}</td>
                    <td className="px-4 py-3 text-stage-mutetext">{item.creatorName || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        item.status === "READY" ? "bg-green-500/20 text-green-400" :
                        item.status === "FAILED" ? "bg-red-500/20 text-red-400" :
                        item.status === "QUEUED" ? "bg-amber-500/20 text-amber-400" :
                        "bg-blue-500/20 text-blue-400"
                      }`}>
                        {item.status || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stage-mutetext">{item.viewCount || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateContentStatus(item.id, "READY")}
                          title="Mark Ready"
                          className="text-green-400 hover:text-green-300"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => updateContentStatus(item.id, "FAILED")}
                          title="Mark Failed"
                          className="text-red-400 hover:text-red-300"
                        >
                          <XCircle size={16} />
                        </button>
                        <button
                          onClick={() => updateContentStatus(item.id, "QUEUED")}
                          title="Re-queue"
                          className="text-amber-400 hover:text-amber-300"
                        >
                          <Clock size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "content" && (
        <div className="text-stage-mutetext text-center py-8">
          Content moderation tools — filter by status, creator, type.
          <p className="text-xs mt-2">Use the Overview tab to manage individual items.</p>
        </div>
      )}

      {tab === "stations" && (
        <div className="text-stage-mutetext text-center py-8">
          Radio station review queue — approve or reject submitted stations.
        </div>
      )}
    </div>
  );
}
