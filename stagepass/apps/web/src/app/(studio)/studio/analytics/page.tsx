"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { BarChart3, Eye, Users, Video, Tv, TrendingUp } from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
  totalContent: number;
  totalViews: number;
  followers: number;
  totalStreams: number;
  topContent: any[];
  recentContent: any[];
}

function StatCard({ label, value, icon: Icon, color = "text-stage-mint", delta }: any) {
  return (
    <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-stage-mutetext uppercase tracking-widest">{label}</p>
        <Icon size={18} className={color} />
      </div>
      <p className="text-3xl font-black">{typeof value === "number" ? value.toLocaleString() : value}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    user.getIdToken().then(token =>
      fetch("/api/analytics", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => { setData(d); setLoading(false); })
        .catch(e => { setError(e.message); setLoading(false); })
    );
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-white/20 border-t-stage-mint rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-400 text-center">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="text-stage-mint" />
            Creator Analytics
          </h1>
          <p className="text-stage-mutetext">Your channel performance at a glance.</p>
        </div>
        <Link href="/studio" className="text-sm text-stage-mutetext hover:text-white transition-colors">
          ← Back to Studio
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Views" value={data?.totalViews || 0} icon={Eye} color="text-stage-mint" />
        <StatCard label="Followers" value={data?.followers || 0} icon={Users} color="text-stage-indigo" />
        <StatCard label="Content Items" value={data?.totalContent || 0} icon={Video} color="text-amber-400" />
        <StatCard label="Live Sessions" value={data?.totalStreams || 0} icon={Tv} color="text-red-400" />
      </div>

      {/* Top Content */}
      <div>
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-stage-mint" />
          Top Performing Content
        </h2>
        {data?.topContent && data.topContent.length > 0 ? (
          <div className="bg-stage-panel border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-stage-mutetext text-xs uppercase tracking-widest">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Views</th>
                </tr>
              </thead>
              <tbody>
                {data.topContent.map((item: any, i: number) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-stage-mutetext font-mono">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/content/${item.id}`} className="hover:text-stage-mint transition-colors">
                        {item.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stage-mutetext">{item.type}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${item.status === "READY" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-stage-mint font-bold">
                      {(item.viewCount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-stage-panel border border-white/10 rounded-2xl p-12 text-center text-stage-mutetext">
            <Video size={40} className="mx-auto mb-4 opacity-40" />
            <p>No content yet. Upload your first video to see analytics.</p>
            <Link href="/studio/uploads" className="mt-4 inline-block text-stage-mint hover:underline text-sm">
              Upload Content →
            </Link>
          </div>
        )}
      </div>

      {/* Recent Content Table */}
      {data?.recentContent && data.recentContent.length > 0 && (
        <div>
          <h2 className="font-bold text-lg mb-4">All Content</h2>
          <div className="bg-stage-panel border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-stage-mutetext text-xs uppercase tracking-widest">
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Views</th>
                </tr>
              </thead>
              <tbody>
                {data.recentContent.map((item: any) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium truncate max-w-[240px]">
                      <Link href={`/content/${item.id}`} className="hover:text-stage-mint">
                        {item.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stage-mutetext text-xs">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        item.status === "READY" ? "bg-green-500/20 text-green-400" :
                        item.status === "FAILED" ? "bg-red-500/20 text-red-400" :
                        "bg-amber-500/20 text-amber-400"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-stage-mutetext">
                      {(item.viewCount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
