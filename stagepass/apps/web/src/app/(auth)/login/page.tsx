import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 bg-stage-panel p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-stage-mutetext">
            Sign in to access your digital stage.
          </p>
        </div>

        <form className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stage-mutetext mb-1">Email</label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stage-mutetext mb-1">Password</label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
          </div>

          <Button variant="primary" className="w-full shadow-glowIndigo" size="lg">
            Sign in
          </Button>
        </form>

        <div className="text-center text-sm text-stage-mutetext">
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold text-stage-indigo hover:text-white transition-colors">
            Join STAGEPASS
          </Link>
        </div>
      </div>
    </div>
  );
}