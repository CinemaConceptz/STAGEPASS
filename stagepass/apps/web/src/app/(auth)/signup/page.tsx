"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Info, 2: Channel Setup
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "", // Channel Slug
    displayName: "", // Public Name
    creatorType: "MUSIC"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Create Auth User
      const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCred.user;

      // 2. Update Display Name
      await updateProfile(user, { displayName: formData.displayName });

      // 3. Create User Profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: formData.email,
        displayName: formData.displayName,
        username: formData.username,
        creatorType: formData.creatorType,
        roles: ["creator"], // Default role
        createdAt: new Date().toISOString()
      });

      // 4. Create Creator Channel Document
      await setDoc(doc(db, "creators", user.uid), {
        ownerUid: user.uid,
        slug: formData.username.toLowerCase(),
        displayName: formData.displayName,
        type: formData.creatorType,
        verified: false,
        followers: 0
      });

      router.push("/studio");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use.");
      } else {
        setError(err.message || "Failed to create account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 bg-stage-panel p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Join the Revolution</h2>
          <p className="mt-2 text-sm text-stage-mutetext">
            Create your channel. Own your audience.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stage-mutetext mb-1">Channel Name (Public)</label>
              <Input 
                name="displayName"
                type="text" 
                placeholder="e.g. DJ Encore"
                value={formData.displayName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stage-mutetext mb-1">Handle (@slug)</label>
                <Input 
                  name="username"
                  type="text" 
                  placeholder="djencore"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stage-mutetext mb-1">Creator Type</label>
                <select 
                  name="creatorType"
                  value={formData.creatorType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-stage-bg px-3 py-3 text-sm text-white outline-none focus:border-stage-mint"
                >
                  <option value="MUSIC">Music</option>
                  <option value="DJ_RADIO">DJ / Radio</option>
                  <option value="FILM">Film</option>
                  <option value="BUSINESS">Business</option>
                  <option value="GAMING">Gaming</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stage-mutetext mb-1">Email</label>
              <Input 
                name="email"
                type="email" 
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stage-mutetext mb-1">Password</label>
              <Input 
                name="password"
                type="password" 
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <Button 
            variant="primary" 
            className="w-full shadow-glowIndigo" 
            size="lg"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="text-center text-sm text-stage-mutetext">
          Already a creator?{" "}
          <Link href="/login" className="font-semibold text-stage-indigo hover:text-white transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}