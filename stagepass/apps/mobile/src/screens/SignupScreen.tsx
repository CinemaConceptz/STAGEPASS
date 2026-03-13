import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { colors, spacing } from "../lib/theme";
import { Ionicons } from "@expo/vector-icons";

export default function SignupScreen({ navigation }: any) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!agreed) { Alert.alert("Terms Required", "Please agree to the Terms of Service."); return; }
    if (!displayName || !email || !password) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      const slug = displayName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid, email, displayName, username: slug,
        roles: ["creator"], socialLinks: {}, driveLinked: false,
        createdAt: new Date().toISOString(),
      });
      await setDoc(doc(db, "creators", cred.user.uid), {
        ownerUid: cred.user.uid, slug, displayName, type: "MUSIC", verified: false, followers: 0,
      });
    } catch (err: any) {
      Alert.alert("Signup Failed", err.message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.logo}>STAGEPASS</Text>
        <Text style={styles.subtitle}>Create your channel. Own your audience.</Text>

        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Channel Name" placeholderTextColor={colors.mutetext} value={displayName} onChangeText={setDisplayName} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.mutetext} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Password"
              placeholderTextColor={colors.mutetext}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.mutetext} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed(!agreed)}>
            <Ionicons name={agreed ? "checkbox" : "square-outline"} size={22} color={agreed ? colors.mint : colors.mutetext} />
            <Text style={styles.termsText}>
              I agree to the Terms of Service and Privacy Policy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, (!agreed || loading) && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={!agreed || loading}
          >
            {loading ? <ActivityIndicator color={colors.black} /> : <Text style={styles.buttonText}>Create Account</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Already a creator? <Text style={styles.linkBold}>Log in</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flexGrow: 1, justifyContent: "center", padding: spacing.xl },
  logo: { fontSize: 36, fontWeight: "900", color: colors.text, textAlign: "center", letterSpacing: 4 },
  subtitle: { fontSize: 14, color: colors.mutetext, textAlign: "center", marginTop: spacing.sm, marginBottom: spacing.xxl },
  form: { gap: spacing.md },
  input: {
    backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: spacing.md, color: colors.text, fontSize: 15, marginBottom: spacing.md,
  },
  passwordRow: { flexDirection: "row", alignItems: "center", position: "relative" },
  eyeBtn: { position: "absolute", right: 14, top: 14 },
  termsRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: spacing.sm },
  termsText: { color: colors.mutetext, fontSize: 13, flex: 1 },
  button: { backgroundColor: colors.mint, borderRadius: 12, padding: spacing.md, alignItems: "center", marginTop: spacing.sm },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.black, fontWeight: "700", fontSize: 16 },
  link: { color: colors.mutetext, textAlign: "center", marginTop: spacing.xl, fontSize: 14 },
  linkBold: { color: colors.indigo, fontWeight: "700" },
});
