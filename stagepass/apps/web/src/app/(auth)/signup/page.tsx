"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Eye, EyeOff, CheckSquare, Square, ExternalLink } from "lucide-react";

type Step = "privacy" | "form";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("privacy");
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    creatorType: "MUSIC"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
  };

  const createUserDocs = async (uid: string, email: string, displayName: string, creatorType: string) => {
    if (!db) return;
    const slug = generateSlug(displayName);
    await setDoc(doc(db, "users", uid), {
      uid,
      email,
      displayName,
      username: slug,
      creatorType,
      roles: ["creator"],
      socialLinks: {},
      driveLinked: false,
      createdAt: new Date().toISOString()
    });
    await setDoc(doc(db, "creators", uid), {
      ownerUid: uid,
      slug,
      displayName,
      type: creatorType,
      verified: false,
      followers: 0
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCred.user, { displayName: formData.displayName });
      await createUserDocs(userCred.user.uid, formData.email, formData.displayName, formData.creatorType);
      router.push("/studio");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email already in use.");
      } else {
        setError(err.message || "Failed to create account.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!auth) return;
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/drive.readonly");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await createUserDocs(user.uid, user.email || "", user.displayName || "Creator", "MUSIC");
      router.push("/studio");
    } catch (err: any) {
      setError(err.message || "Google sign-up failed.");
    } finally {
      setLoading(false);
    }
  };

  // Privacy Agreement Step
  if (step === "privacy") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md space-y-6 bg-stage-panel p-8 rounded-2xl border border-white/10 shadow-2xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight" data-testid="privacy-heading">Before You Join</h2>
            <p className="mt-2 text-sm text-stage-mutetext">
              Please review and accept our terms to continue.
            </p>
          </div>

          <div className="bg-black/20 rounded-xl p-4 max-h-60 overflow-y-auto text-sm text-stage-mutetext space-y-3">
            <p className="font-bold text-white">Terms of Service &amp; Privacy Policy</p>
            <p>By creating an account on STAGEPASS, you agree to our Terms of Service, Privacy Policy, Community Guidelines, and Creator Agreement.</p>
            <p>You must be at least 18 years old to use the Services. Creators retain ownership of their content but grant STAGEPASS a license to host, process, stream, and distribute their content.</p>
            <p>We collect account information, usage data, and content metadata to provide and improve our services. We do not sell your personal data.</p>
            <div className="flex gap-2 pt-2">
              <Link href="/legal/terms" className="text-stage-mint hover:underline inline-flex items-center gap-1 text-xs" target="_blank">
                Terms <ExternalLink size={10} />
              </Link>
              <Link href="/legal/privacy" className="text-stage-mint hover:underline inline-flex items-center gap-1 text-xs" target="_blank">
                Privacy <ExternalLink size={10} />
              </Link>
              <Link href="/legal/community" className="text-stage-mint hover:underline inline-flex items-center gap-1 text-xs" target="_blank">
                Community <ExternalLink size={10} />
              </Link>
            </div>
          </div>

          <button
            onClick={() => setAgreed(!agreed)}
            className="flex items-center gap-3 w-full text-left text-sm"
            data-testid="privacy-checkbox"
          >
            {agreed ? (
              <CheckSquare size={20} className="text-stage-mint shrink-0" />
            ) : (
              <Square size={20} className="text-stage-mutetext shrink-0" />
            )}
            <span className={agreed ? "text-white" : "text-stage-mutetext"}>
              I have read and agree to the Terms of Service, Privacy Policy, and Community Guidelines
            </span>
          </button>

          <Button
            variant="primary"
            className="w-full shadow-glowIndigo"
            size="lg"
            disabled={!agreed}
            onClick={() => setStep("form")}
            data-testid="privacy-continue-btn"
          >
            Continue to Sign Up
          </Button>

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

  // Sign Up Form
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 bg-stage-panel p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight" data-testid="signup-heading">Join the Revolution</h2>
          <p className="mt-2 text-sm text-stage-mutetext">
            Create your channel. Own your audience.
          </p>
        </div>

        {/* Google Sign Up */}
        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          data-testid="google-signup-btn"
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign up with Google (includes Drive access)
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-stage-panel px-3 text-stage-mutetext">or create with email</span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-5" data-testid="signup-form">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stage-mutetext mb-1">Channel Name</label>
              <Input
                name="displayName"
                type="text"
                placeholder="e.g. DJ Encore"
                value={formData.displayName}
                onChange={handleChange}
                required
                data-testid="signup-displayname-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stage-mutetext mb-1">Creator Type</label>
              <select
                name="creatorType"
                value={formData.creatorType}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-stage-bg px-3 py-3 text-sm text-white outline-none focus:border-stage-mint"
                data-testid="signup-creatortype-select"
              >
                <option value="MUSIC">Music</option>
                <option value="DJ_RADIO">DJ / Radio</option>
                <option value="FILM">Film</option>
                <option value="BUSINESS">Business</option>
                <option value="GAMING">Gaming</option>
              </select>
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
                data-testid="signup-email-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stage-mutetext mb-1">Password</label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pr-12"
                  data-testid="signup-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stage-mutetext hover:text-white transition-colors"
                  data-testid="signup-password-toggle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center" data-testid="signup-error">{error}</p>}

          <Button
            variant="primary"
            className="w-full shadow-glowIndigo"
            size="lg"
            type="submit"
            disabled={loading}
            data-testid="signup-submit-btn"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-xs text-stage-mutetext">
          Google sign-up automatically links your Google Drive for media uploads.
        </p>

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
