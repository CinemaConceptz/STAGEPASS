import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Image, RefreshControl,
} from "react-native";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { colors, spacing } from "../lib/theme";
import { Ionicons } from "@expo/vector-icons";

interface ContentItem {
  id: string;
  title: string;
  type: string;
  thumbnailUrl?: string;
  creatorName?: string;
  viewCount?: number;
}

export default function FeedScreen({ navigation }: any) {
  const [feed, setFeed] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "content"), orderBy("createdAt", "desc"), limit(20));
      const snap = await getDocs(q);
      setFeed(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContentItem)));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchFeed(); }, []);

  const renderItem = ({ item }: { item: ContentItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("Player", { contentId: item.id })}
    >
      <View style={styles.thumbnail}>
        {item.thumbnailUrl ? (
          <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbImg} />
        ) : (
          <Ionicons name="play-circle" size={40} color={colors.mutetext} />
        )}
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardMeta}>
          {item.creatorName || "Creator"}
          {item.viewCount ? ` · ${item.viewCount.toLocaleString()} views` : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>STAGEPASS</Text>
      </View>
      <FlatList
        data={feed}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchFeed} tintColor={colors.mint} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="film-outline" size={48} color={colors.mutetext} />
              <Text style={styles.emptyText}>No premieres yet.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.md },
  headerTitle: { fontSize: 28, fontWeight: "900", color: colors.text, letterSpacing: 3 },
  list: { padding: spacing.md, gap: spacing.md },
  card: { backgroundColor: colors.panel, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
  thumbnail: { aspectRatio: 16 / 9, backgroundColor: colors.black, justifyContent: "center", alignItems: "center" },
  thumbImg: { width: "100%", height: "100%", resizeMode: "cover" },
  typeBadge: { position: "absolute", top: 8, left: 8, backgroundColor: "rgba(0,0,0,0.7)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  typeText: { color: colors.mint, fontSize: 10, fontWeight: "700" },
  cardInfo: { padding: spacing.md },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  cardMeta: { fontSize: 12, color: colors.mutetext, marginTop: 4 },
  empty: { alignItems: "center", paddingTop: spacing.xxl * 2 },
  emptyText: { color: colors.mutetext, marginTop: spacing.md, fontSize: 16 },
});
