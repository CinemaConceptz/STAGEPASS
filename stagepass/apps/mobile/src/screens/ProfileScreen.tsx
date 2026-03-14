import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Image,
} from "react-native";
import { signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { colors, spacing } from "../lib/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [socialLinks, setSocialLinks] = useState({ instagram: "", twitter: "", youtube: "", tiktok: "", website: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const d = snap.data();
          setDisplayName(d.displayName || user.displayName || "");
          setBio(d.bio || "");
          setAvatarUrl(d.avatarUrl || user.photoURL || "");
          setSocialLinks({ ...socialLinks, ...(d.socialLinks || {}) });
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [user]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), { displayName, bio, avatarUrl, socialLinks, updatedAt: new Date().toISOString() }, { merge: true });
      await setDoc(doc(db, "creators", user.uid), { displayName, bio, avatarUrl, updatedAt: new Date().toISOString() }, { merge: true });
      await updateProfile(user, { displayName, photoURL: avatarUrl || undefined });
      Alert.alert("Saved", "Profile updated successfully.");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
    setSaving(false);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut(auth) },
    ]);
  };

  if (loading) return <View style={styles.container}><ActivityIndicator color={colors.mint} style={{ marginTop: 100 }} /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.headerTitle}>Profile</Text>

      {/* Avatar */}
      <TouchableOpacity style={styles.avatarSection} onPress={pickImage}>
        <View style={styles.avatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
          ) : (
            <Ionicons name="person" size={36} color={colors.mutetext} />
          )}
        </View>
        <Text style={styles.changePhoto}>Tap to change photo</Text>
      </TouchableOpacity>

      {/* Fields */}
      <View style={styles.section}>
        <Text style={styles.label}>Display Name</Text>
        <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} placeholderTextColor={colors.mutetext} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Bio</Text>
        <TextInput style={[styles.input, { height: 80, textAlignVertical: "top" }]} value={bio} onChangeText={setBio} multiline placeholderTextColor={colors.mutetext} placeholder="Tell your audience about yourself..." />
      </View>

      <Text style={styles.sectionTitle}>Social Links</Text>
      {(["instagram", "twitter", "youtube", "tiktok", "website"] as const).map((key) => (
        <View key={key} style={styles.section}>
          <Text style={styles.label}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
          <TextInput
            style={styles.input}
            value={socialLinks[key]}
            onChangeText={(v) => setSocialLinks({ ...socialLinks, [key]: v })}
            placeholderTextColor={colors.mutetext}
            placeholder={key === "website" ? "https://..." : `@yourhandle`}
            autoCapitalize="none"
          />
        </View>
      ))}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color={colors.black} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xxl * 2 },
  headerTitle: { fontSize: 28, fontWeight: "900", color: colors.text, letterSpacing: 3, marginBottom: spacing.lg },
  avatarSection: { alignItems: "center", marginBottom: spacing.xl },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.panel, borderWidth: 2, borderColor: colors.border, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  avatarImg: { width: "100%", height: "100%", resizeMode: "cover" },
  changePhoto: { color: colors.mint, fontSize: 13, marginTop: spacing.sm, fontWeight: "600" },
  section: { marginBottom: spacing.md },
  label: { fontSize: 12, color: colors.mutetext, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 },
  input: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md, color: colors.text, fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  saveBtn: { backgroundColor: colors.mint, borderRadius: 12, padding: spacing.md, alignItems: "center", marginTop: spacing.xl },
  saveBtnText: { color: colors.black, fontWeight: "700", fontSize: 16 },
  signOutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: spacing.xl, padding: spacing.md },
  signOutText: { color: colors.error, fontSize: 15, fontWeight: "600" },
});
