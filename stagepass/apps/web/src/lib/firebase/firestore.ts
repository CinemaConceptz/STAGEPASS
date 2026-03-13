import {
  collection, getDocs, query, orderBy, limit,
  doc, getDoc, where, onSnapshot, addDoc, deleteDoc,
  updateDoc, increment, serverTimestamp, writeBatch, setDoc,
  type DocumentData, type Unsubscribe
} from "firebase/firestore";
import { db } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ContentItem {
  id: string;
  title: string;
  type: "VIDEO" | "AUDIO" | "MIX" | "LIVE" | "EPISODE";
  status?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  creatorId?: string;
  creatorName?: string;
  creatorSlug?: string;
  playbackUrl?: string;
  viewCount?: number;
  createdAt: string;
}

export interface Creator {
  uid: string;
  slug: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  type?: string;
  followerCount?: number;
  isAdmin?: boolean;
}

export interface Notification {
  id: string;
  type: "LIVE" | "UPLOAD" | "FOLLOW";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  createdAt: any;
}

function mapContent(d: DocumentData, id: string): ContentItem {
  return {
    id,
    title: d.title || "Untitled",
    type: d.type || "VIDEO",
    status: d.status,
    thumbnail: d.thumbnailUrl || d.thumbnail,
    thumbnailUrl: d.thumbnailUrl || d.thumbnail,
    creatorId: d.creatorId || d.ownerUid,
    creatorName: d.creatorName || "Unknown",
    creatorSlug: d.creatorSlug || "user",
    playbackUrl: d.playbackUrl,
    viewCount: d.viewCount || 0,
    createdAt: d.createdAt || new Date().toISOString(),
  };
}

// ─── Content ─────────────────────────────────────────────────────────────────
export async function getRecentContent(): Promise<ContentItem[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, "content"), orderBy("createdAt", "desc"), limit(20));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(d => mapContent(d.data(), d.id))
      .filter(c => !c.status || c.status === "READY");
  } catch (e) { return []; }
}

export async function getContentById(id: string): Promise<ContentItem | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "content", id));
    if (!snap.exists()) return null;
    return mapContent(snap.data(), snap.id);
  } catch (e) { return null; }
}

export async function incrementViewCount(contentId: string) {
  if (!db) return;
  try {
    await updateDoc(doc(db, "content", contentId), { viewCount: increment(1) });
  } catch (_) {}
}

// ─── Creators ────────────────────────────────────────────────────────────────
export async function getCreatorBySlug(slug: string): Promise<Creator | null> {
  if (!db) return null;
  try {
    const q = query(collection(db, "creators"), where("slug", "==", slug), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0].data();
    return { uid: snap.docs[0].id, slug: d.slug, displayName: d.displayName || slug, bio: d.bio, avatarUrl: d.avatarUrl, type: d.type, followerCount: d.followerCount || 0, isAdmin: d.isAdmin };
  } catch (e) { return null; }
}

export async function getContentByCreator(creatorId: string): Promise<ContentItem[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, "content"), where("creatorId", "==", creatorId), orderBy("createdAt", "desc"), limit(12));
    const snap = await getDocs(q);
    return snap.docs.map(d => mapContent(d.data(), d.id)).filter(c => !c.status || c.status === "READY");
  } catch (e) { return []; }
}

export async function getAllContent(): Promise<ContentItem[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, "content"), orderBy("createdAt", "desc"), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(d => mapContent(d.data(), d.id));
  } catch (e) { return []; }
}

// ─── Live Channels ───────────────────────────────────────────────────────────
export async function getLiveChannels(): Promise<any[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, "liveChannels"), where("status", "==", "LIVE"), orderBy("startedAt", "desc"), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { return []; }
}

export async function trackListener(channelCollection: string, channelId: string, delta: 1 | -1) {
  if (!db) return;
  try {
    await updateDoc(doc(db, channelCollection, channelId), { listenerCount: increment(delta) });
  } catch (_) {}
}

// ─── Follow System ────────────────────────────────────────────────────────────
export async function isFollowing(followerId: string, creatorId: string): Promise<boolean> {
  if (!db) return false;
  try {
    const snap = await getDoc(doc(db, "follows", `${followerId}_${creatorId}`));
    return snap.exists();
  } catch (e) { return false; }
}

export async function followCreator(followerId: string, creatorId: string) {
  if (!db) return;
  const batch = writeBatch(db);
  batch.set(doc(db, "follows", `${followerId}_${creatorId}`), {
    followerId, creatorId, createdAt: new Date().toISOString()
  });
  batch.update(doc(db, "creators", creatorId), { followerCount: increment(1) });
  await batch.commit();
}

export async function unfollowCreator(followerId: string, creatorId: string) {
  if (!db) return;
  const batch = writeBatch(db);
  batch.delete(doc(db, "follows", `${followerId}_${creatorId}`));
  batch.update(doc(db, "creators", creatorId), { followerCount: increment(-1) });
  await batch.commit();
}

export async function getFollowedFeed(userId: string): Promise<ContentItem[]> {
  if (!db) return [];
  try {
    const followsSnap = await getDocs(query(collection(db, "follows"), where("followerId", "==", userId)));
    if (followsSnap.empty) return [];
    const creatorIds = followsSnap.docs.map(d => d.data().creatorId);
    const chunk = creatorIds.slice(0, 10);
    const q = query(collection(db, "content"), where("creatorId", "in", chunk), orderBy("createdAt", "desc"), limit(20));
    const snap = await getDocs(q);
    return snap.docs.map(d => mapContent(d.data(), d.id)).filter(c => c.status === "READY");
  } catch (e) { return []; }
}

// ─── Notifications ────────────────────────────────────────────────────────────
export function subscribeNotifications(userId: string, cb: (notifs: Notification[]) => void): Unsubscribe {
  if (!db) return () => {};
  const q = query(collection(db, "notifications", userId, "items"), orderBy("createdAt", "desc"), limit(20));
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)));
  });
}

export async function markNotificationRead(userId: string, notifId: string) {
  if (!db) return;
  await updateDoc(doc(db, "notifications", userId, "items", notifId), { read: true });
}

export async function markAllNotificationsRead(userId: string) {
  if (!db) return;
  const q = query(collection(db, "notifications", userId, "items"), where("read", "==", false));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.update(d.ref, { read: true }));
  await batch.commit();
}

// ─── Live Chat ────────────────────────────────────────────────────────────────
export function subscribeChat(channelId: string, cb: (messages: ChatMessage[]) => void): Unsubscribe {
  if (!db) return () => {};
  const q = query(collection(db, "liveChats", channelId, "messages"), orderBy("createdAt", "asc"), limit(100));
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
  });
}

export async function sendChatMessage(channelId: string, userId: string, displayName: string, text: string) {
  if (!db || !text.trim()) return;
  await addDoc(collection(db, "liveChats", channelId, "messages"), {
    userId, displayName, text: text.trim(), createdAt: serverTimestamp()
  });
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export async function getCreatorAnalytics(creatorId: string) {
  if (!db) return null;
  try {
    const [contentSnap, followsSnap, creatorSnap] = await Promise.all([
      getDocs(query(collection(db, "content"), where("creatorId", "==", creatorId))),
      getDocs(query(collection(db, "follows"), where("creatorId", "==", creatorId))),
      getDoc(doc(db, "creators", creatorId)),
    ]);
    const contents = contentSnap.docs.map(d => d.data());
    const totalViews = contents.reduce((s, c) => s + (c.viewCount || 0), 0);
    return {
      totalContent: contents.length,
      totalViews,
      followers: followsSnap.size,
      content: contentSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    };
  } catch (e) { return null; }
}

export async function getAdminStats() {
  if (!db) return null;
  try {
    const [usersSnap, contentSnap, stationsSnap, liveSnap] = await Promise.all([
      getDocs(query(collection(db, "users"), limit(200))),
      getDocs(query(collection(db, "content"), limit(200))),
      getDocs(query(collection(db, "radioStations"), limit(200))),
      getDocs(query(collection(db, "liveChannels"), limit(200))),
    ]);
    return {
      totalUsers: usersSnap.size,
      totalContent: contentSnap.size,
      totalStations: stationsSnap.size,
      totalLiveSessions: liveSnap.size,
      recentContent: contentSnap.docs.slice(0, 20).map(d => ({ id: d.id, ...d.data() })),
    };
  } catch (e) { return null; }
}
