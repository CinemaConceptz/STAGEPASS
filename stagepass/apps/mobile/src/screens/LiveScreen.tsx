import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from "react-native";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { colors, spacing } from "../lib/theme";
import { Ionicons } from "@expo/vector-icons";

interface LiveChannel {
  id: string;
  title: string;
  ownerUid: string;
  status: string;
  listenerCount?: number;
}

export default function LiveScreen() {
  const [channels, setChannels] = useState<LiveChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, "liveChannels"), where("status", "==", "LIVE"), orderBy("startedAt", "desc"), limit(10));
        const snap = await getDocs(q);
        setChannels(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LiveChannel)));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LIVE</Text>
        <Text style={styles.headerSub}>Watch creators broadcast in real time</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.mint} style={{ marginTop: spacing.xxl }} />
      ) : channels.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="videocam-outline" size={56} color={colors.mutetext} />
          <Text style={styles.emptyTitle}>No live streams right now</Text>
          <Text style={styles.emptyText}>Check back later for live broadcasts.</Text>
        </View>
      ) : (
        <FlatList
          data={channels}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardThumb}>
                <Ionicons name="radio" size={36} color={colors.indigo} />
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>
                  {item.listenerCount ? `${item.listenerCount} watching` : "Starting..."}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.md },
  headerTitle: { fontSize: 28, fontWeight: "900", color: colors.text, letterSpacing: 3 },
  headerSub: { fontSize: 14, color: colors.mutetext, marginTop: 4 },
  list: { padding: spacing.md, gap: spacing.md },
  card: { backgroundColor: colors.panel, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
  cardThumb: { aspectRatio: 16 / 9, backgroundColor: colors.black, justifyContent: "center", alignItems: "center" },
  liveBadge: {
    position: "absolute", top: 10, left: 10,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(239,68,68,0.9)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.white },
  liveText: { color: colors.white, fontSize: 10, fontWeight: "800" },
  cardInfo: { padding: spacing.md },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  cardMeta: { fontSize: 12, color: colors.mutetext, marginTop: 4 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: spacing.xxl * 2 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "700", marginTop: spacing.lg },
  emptyText: { color: colors.mutetext, fontSize: 14, marginTop: spacing.xs },
});
