import {
  collection, getDocs, query, orderBy, limit,
  doc, getDoc, where, type DocumentData
} from "firebase/firestore";
import { db } from "./client";

export interface ContentItem {
  id: string;
  title: string;
  type: "VIDEO" | "AUDIO" | "MIX" | "LIVE" | "EPISODE";
  status?: string;
  thumbnail?: string;
  creatorId?: string;
  creatorName?: string;
  creatorSlug?: string;
  playbackUrl?: string;
  createdAt: string;
}

export interface Creator {
  uid: string;
  slug: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  type?: string;
}

function mapContent(d: DocumentData, id: string): ContentItem {
  return {
    id,
    title: d.title || "Untitled",
    type: d.type || "VIDEO",
    status: d.status,
    thumbnail: d.thumbnailUrl || d.thumbnail,
    creatorId: d.creatorId || d.ownerUid,
    creatorName: d.creatorName || "Unknown",
    creatorSlug: d.creatorSlug || "user",
    playbackUrl: d.playbackUrl,
    createdAt: d.createdAt || new Date().toISOString(),
  };
}

export async function getRecentContent(): Promise<ContentItem[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, "content"), orderBy("createdAt", "desc"), limit(20));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(d => mapContent(d.data(), d.id))
      .filter(c => !c.status || c.status === "READY");
  } catch (e) {
    console.error("Error fetching content:", e);
    return [];
  }
}

export async function getContentById(id: string): Promise<ContentItem | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "content", id));
    if (!snap.exists()) return null;
    return mapContent(snap.data(), snap.id);
  } catch (e) {
    return null;
  }
}

export async function getCreatorBySlug(slug: string): Promise<Creator | null> {
  if (!db) return null;
  try {
    const q = query(collection(db, "creators"), where("slug", "==", slug), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0].data();
    return {
      uid: snap.docs[0].id,
      slug: d.slug,
      displayName: d.displayName || d.name || slug,
      bio: d.bio,
      avatarUrl: d.avatarUrl,
      type: d.type,
    };
  } catch (e) {
    return null;
  }
}

export async function getContentByCreator(creatorId: string): Promise<ContentItem[]> {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "content"),
      where("creatorId", "==", creatorId),
      orderBy("createdAt", "desc"),
      limit(12)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(d => mapContent(d.data(), d.id))
      .filter(c => !c.status || c.status === "READY");
  } catch (e) {
    return [];
  }
}

export async function getLiveChannels(): Promise<any[]> {
  if (!db) return [];
  try {
    const q = query(
      collection(db, "liveChannels"),
      where("status", "==", "LIVE"),
      orderBy("startedAt", "desc"),
      limit(10)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return [];
  }
}
