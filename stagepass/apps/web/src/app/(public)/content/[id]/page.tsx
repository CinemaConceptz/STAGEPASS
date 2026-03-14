"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import Player from "@/components/stagepass/Player";
import Comments from "@/components/stagepass/Comments";
import FollowButton from "@/components/stagepass/FollowButton";
import ShareButtons from "@/components/stagepass/ShareButtons";
import { incrementViewCount, trackListener } from "@/lib/firebase/firestore";
import { Eye } from "lucide-react";
import Link from "next/link";
import { ContentItem } from "@/lib/firebase/firestore";

export default function ContentPage({ params }: { params: { id: string } }) {
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    fetch(`/api/content/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setContent(data.item || null);
        setViewCount(data.item?.viewCount || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  // Track view + listener count
  useEffect(() => {
    if (!content?.id) return;
    incrementViewCount(content.id);
    setViewCount(v => v + 1);
    trackListener("content", content.id, 1);
    return () => { trackListener("content", content.id!, -1); };
  }, [content?.id]);

  const pageUrl = `https://stagepassaccess.com/content/${params.id}`;
  const ogTitle = content ? `${content.title} — STAGEPASS` : "STAGEPASS";
  const ogDescription = content ? `Watch "${content.title}" by ${content.creatorName || "a creator"} on STAGEPASS — the creator-first platform.` : "STAGEPASS — Creator Ecosystem";
  const ogImage = content?.thumbnailUrl || content?.thumbnail || "https://stagepassaccess.com/og-default.png";

  if (loading) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="h-8 w-8 border-2 border-white/20 border-t-stage-mint rounded-full animate-spin" />
    </div>
  );
  if (!content) return <div className="text-center py-24"><h1 className="text-2xl font-bold">Content not found.</h1></div>;

  return (
    <>
      {/* Open Graph / Twitter Card meta tags for social sharing previews */}
      <Head>
        <title>{ogTitle}</title>
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="video.other" />
        <meta property="og:site_name" content="STAGEPASS" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:site" content="@stagepassaccess" />
      </Head>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Player + Info */}
        <div className="lg:col-span-2 space-y-6">
          <Player
            hlsUrl={content.playbackUrl}
            contentId={params.id}
            driveFileId={content.driveFileId}
            showListenerCount={false}
          />

          <div className="space-y-4">
            <h1 className="text-xl sm:text-2xl font-bold">{content.title}</h1>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-stage-panel border border-white/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-stage-mint">
                    {content.creatorName?.charAt(0)?.toUpperCase() || "C"}
                  </span>
                </div>
                <div>
                  <Link href={`/c/${content.creatorSlug}`} className="font-bold text-sm hover:text-stage-mint transition-colors">
                    {content.creatorName}
                  </Link>
                  <p className="text-xs text-stage-mutetext">Content Creator</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 text-stage-mutetext text-sm">
                  <Eye size={14} />
                  <span>{viewCount.toLocaleString()} views</span>
                </div>
                {content.creatorId && <FollowButton creatorId={content.creatorId} />}
                <ShareButtons
                  contentId={params.id}
                  title={content.title}
                  creatorName={content.creatorName}
                  thumbnailUrl={content.thumbnailUrl || content.thumbnail}
                />
              </div>
            </div>

            <p className="text-stage-mutetext text-sm">
              Premiered {new Date(content.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Comments */}
        <div>
          <Comments contentId={params.id} className="h-full min-h-[500px]" />
        </div>
      </div>
    </>
  );
}
