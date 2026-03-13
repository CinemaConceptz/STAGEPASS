import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { colors, spacing } from "../lib/theme";
import { Ionicons } from "@expo/vector-icons";

interface Station {
  id: string;
  name: string;
  genre: string;
  description?: string;
  artworkUrl?: string;
  trackCount?: number;
  autoDjEnabled?: boolean;
}

export default function RadioScreen() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStation, setActiveStation] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<any>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db, "radioStations"), limit(20));
        const snap = await getDocs(q);
        setStations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Station)));
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();

    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  const playStation = async (id: string) => {
    // Stop current
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    if (activeStation === id) {
      setActiveStation(null);
      setNowPlaying(null);
      return;
    }

    setActiveStation(id);
    try {
      const WEB_URL = "https://stagepass-web-rmpe2fteqq-uc.a.run.app";
      const res = await fetch(`${WEB_URL}/api/radio/station/now?stationId=${id}`);
      const data = await res.json();
      if (data.success && data.nowPlaying?.track?.url) {
        setNowPlaying(data.nowPlaying);
        const { sound } = await Audio.Sound.createAsync(
          { uri: data.nowPlaying.track.url },
          { shouldPlay: true, positionMillis: data.nowPlaying.offsetMs || 0 }
        );
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.didJustFinish) playStation(id); // Loop
        });
      }
    } catch (e) { console.error(e); }
  };

  const renderStation = ({ item }: { item: Station }) => (
    <TouchableOpacity style={styles.card} onPress={() => playStation(item.id)}>
      <View style={styles.artwork}>
        {item.artworkUrl ? (
          <Image source={{ uri: item.artworkUrl }} style={styles.artworkImg} />
        ) : (
          <Ionicons name="radio" size={32} color={colors.mutetext} />
        )}
        {activeStation === item.id && (
          <View style={styles.playingOverlay}>
            <Ionicons name="pause" size={28} color={colors.black} />
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <View style={styles.genreBadge}>
          <Text style={styles.genreText}>{item.genre}</Text>
        </View>
        <Text style={styles.stationName}>{item.name}</Text>
        <Text style={styles.trackCount}>{item.trackCount || 0} tracks</Text>
        {item.autoDjEnabled !== false && (
          <View style={styles.autoDjBadge}>
            <Ionicons name="flash" size={10} color={colors.mint} />
            <Text style={styles.autoDjText}>Auto-DJ</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>RADIO</Text>
        <Text style={styles.headerSub}>Tune into creator broadcasts</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.mint} style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlatList
          data={stations}
          keyExtractor={(item) => item.id}
          renderItem={renderStation}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.md }}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="radio-outline" size={48} color={colors.mutetext} />
              <Text style={styles.emptyText}>No stations online.</Text>
            </View>
          }
        />
      )}

      {/* Mini Player */}
      {activeStation && nowPlaying && (
        <View style={styles.miniPlayer}>
          <Ionicons name="musical-notes" size={20} color={colors.mint} />
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.miniTitle} numberOfLines={1}>{nowPlaying.track?.title || "Playing"}</Text>
            <Text style={styles.miniStation}>{stations.find(s => s.id === activeStation)?.name}</Text>
          </View>
          <TouchableOpacity onPress={() => playStation(activeStation)}>
            <Ionicons name="pause-circle" size={36} color={colors.white} />
          </TouchableOpacity>
        </View>
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
  card: { flex: 1, backgroundColor: colors.panel, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
  artwork: { aspectRatio: 1, backgroundColor: colors.black, justifyContent: "center", alignItems: "center" },
  artworkImg: { width: "100%", height: "100%", resizeMode: "cover" },
  playingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,255,198,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: { padding: spacing.sm },
  genreBadge: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: "flex-start", marginBottom: 4 },
  genreText: { fontSize: 10, fontWeight: "700", color: colors.mint, textTransform: "uppercase" },
  stationName: { fontSize: 14, fontWeight: "700", color: colors.text },
  trackCount: { fontSize: 11, color: colors.mutetext, marginTop: 2 },
  autoDjBadge: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  autoDjText: { fontSize: 10, color: colors.mint, fontWeight: "600" },
  empty: { alignItems: "center", paddingTop: spacing.xxl * 2 },
  emptyText: { color: colors.mutetext, marginTop: spacing.md, fontSize: 16 },
  miniPlayer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.panel, borderTopWidth: 1, borderTopColor: colors.border,
    padding: spacing.md, paddingBottom: spacing.xl,
  },
  miniTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  miniStation: { fontSize: 11, color: colors.mutetext, textTransform: "uppercase", letterSpacing: 1 },
});
