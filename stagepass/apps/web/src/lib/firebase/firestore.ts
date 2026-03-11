import { collection, getDocs, query, orderBy, limit, doc, getDoc, where } from "firebase/firestore";
import { db } from "./client";

export interface ContentItem {
  id: string;
  title: string;
  type: "VIDEO" | "AUDIO" | "MIX" | "LIVE";
  thumbnail?: string;
  creatorId?: string;
  creatorName?: string;
  creatorSlug?: string;
  playbackUrl?: string;
  createdAt: string;
}

export async function getRecentContent(): Promise<ContentItem[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, "content"), orderBy("createdAt", "desc"), limit(20));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || "Untitled",
        type: data.type || "VIDEO",
        thumbnail: data.thumbnailUrl,
        creatorId: data.creatorId,
        creatorName: data.creatorName || "Unknown",
        creatorSlug: data.creatorSlug || "user",
        playbackUrl: data.playbackUrl,
        createdAt: data.createdAt
      };
    });
  } catch (e) {
    console.error("Error fetching content:", e);
    return [];
  }
}

export async function getContentById(id: string): Promise<ContentItem | null> {
  if (!db) return null;
  try {
    const docRef = doc(db, "content", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      title: data.title,
      type: data.type,
      thumbnail: data.thumbnailUrl,
      creatorId: data.creatorId,
      creatorName: data.creatorName,
      creatorSlug: data.creatorSlug,
      playbackUrl: data.playbackUrl,
      createdAt: data.createdAt
    };
  } catch (e) {
    return null;
  }
}
