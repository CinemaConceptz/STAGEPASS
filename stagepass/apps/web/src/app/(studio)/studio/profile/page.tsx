"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile, updateUserProfile, updateCreatorProfile } from "@/lib/firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { User, Camera, Save, Link as LinkIcon, ExternalLink, HardDrive, LogOut, CheckCircle } from "lucide-react";
import ImageUploader from "@/components/studio/ImageUploader";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    twitter: "",
    youtube: "",
    tiktok: "",
    website: ""
  });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const p = await getUserProfile(user.uid);
      if (p) {
        setProfile(p);
        setDisplayName(p.displayName || user.displayName || "");
        setBio(p.bio || "");
        setAvatarUrl(p.avatarUrl || user.photoURL || "");
        setSocialLinks({
          instagram: p.socialLinks?.instagram || "",
          twitter: p.socialLinks?.twitter || "",
          youtube: p.socialLinks?.youtube || "",
          tiktok: p.socialLinks?.tiktok || "",
          website: p.socialLinks?.website || "",
        });
      } else {
        setDisplayName(user.displayName || "");
        setAvatarUrl(user.photoURL || "");
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, {
        displayName,
        bio,
        avatarUrl,
        socialLinks,
      });
      await updateCreatorProfile(user.uid, {
        displayName,
        bio,
        avatarUrl,
      });
      if (auth) {
        await updateProfile(user, { displayName, photoURL: avatarUrl || undefined });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/");
    }
  };

  const handleLinkDrive = async () => {
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      if (!auth) return;
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/drive.readonly");
      await signInWithPopup(auth, provider);
      await updateUserProfile(user!.uid, { driveLinked: true, driveLinkedAt: new Date().toISOString() });
      setProfile({ ...profile, driveLinked: true });
    } catch (e: any) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <p className="text-stage-mutetext">Please log in to view your profile.</p>
        <Link href="/login"><Button variant="primary" className="mt-4">Log In</Button></Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="h-10 w-10 mx-auto border-2 border-white/20 border-t-stage-mint rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" data-testid="profile-heading">My Profile</h1>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-stage-mutetext hover:text-red-400 transition-colors"
          data-testid="signout-btn"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Avatar */}
      <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-lg border-b border-white/10 pb-2">Profile Photo</h3>
        <ImageUploader
          value={avatarUrl}
          onChange={setAvatarUrl}
          label="PNG, JPG, or WebP. Max 5MB. Square recommended."
        />
      </div>

      {/* Basic Info */}
      <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-lg border-b border-white/10 pb-2">Channel Info</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stage-mutetext mb-1">Display Name</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your public name"
              data-testid="profile-name-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stage-mutetext mb-1">Bio</label>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-stage-bg px-4 py-3 text-sm text-white outline-none placeholder:text-stage-mutetext transition-all focus:border-stage-mint h-24 resize-none"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your audience about yourself..."
              data-testid="profile-bio-input"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-lg border-b border-white/10 pb-2 flex items-center gap-2">
          <LinkIcon size={18} /> Social Links
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: "instagram", label: "Instagram", placeholder: "@yourhandle" },
            { key: "twitter", label: "X / Twitter", placeholder: "@yourhandle" },
            { key: "youtube", label: "YouTube", placeholder: "youtube.com/c/yourchannel" },
            { key: "tiktok", label: "TikTok", placeholder: "@yourhandle" },
            { key: "website", label: "Website", placeholder: "https://yoursite.com" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-stage-mutetext mb-1">{label}</label>
              <Input
                value={(socialLinks as any)[key]}
                onChange={(e) => setSocialLinks({ ...socialLinks, [key]: e.target.value })}
                placeholder={placeholder}
                data-testid={`profile-social-${key}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Google Drive Link */}
      <div className="bg-stage-panel border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-lg border-b border-white/10 pb-2 flex items-center gap-2">
          <HardDrive size={18} /> Google Drive Connection
        </h3>
        {profile?.driveLinked ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-stage-mint/10 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-stage-mint" />
              </div>
              <div>
                <p className="font-medium text-white">Google Drive Connected</p>
                <p className="text-xs text-stage-mutetext">
                  {profile.driveLinkedAt ? `Linked on ${new Date(profile.driveLinkedAt).toLocaleDateString()}` : "Active"}
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLinkDrive} data-testid="relink-drive-btn">
              Re-link
            </Button>
          </div>
        ) : (
          <div className="text-center py-4 space-y-3">
            <p className="text-sm text-stage-mutetext">
              Connect your Google Drive to upload videos and audio files to your station.
            </p>
            <Button variant="primary" onClick={handleLinkDrive} data-testid="link-drive-btn">
              <HardDrive size={16} className="mr-2" /> Link Google Drive
            </Button>
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex items-center justify-between">
        {saved && (
          <span className="text-stage-mint text-sm flex items-center gap-1">
            <CheckCircle size={14} /> Profile saved!
          </span>
        )}
        <div className="ml-auto">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSave}
            disabled={saving}
            data-testid="profile-save-btn"
          >
            {saving ? "Saving..." : <><Save size={16} className="mr-2" /> Save Changes</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
