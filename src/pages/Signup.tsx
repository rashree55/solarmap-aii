import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Signup() {
  const { signUpWithEmail, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Availability states
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [phoneAvailable, setPhoneAvailable] = useState<boolean | null>(null);
  const [phoneChecking, setPhoneChecking] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard/new-analysis", { replace: true });
  }, [user, navigate]);

  // Debounced username check
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    setUsernameChecking(true);
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();
      setUsernameAvailable(!data);
      setUsernameChecking(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  // Debounced phone check
  useEffect(() => {
    if (phone.length < 7) {
      setPhoneAvailable(null);
      return;
    }
    setPhoneChecking(true);
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone", phone)
        .maybeSingle();
      setPhoneAvailable(!data);
      setPhoneChecking(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [phone]);

  const isPasswordValid = password.length >= 6;
  const passwordsMatch = password === confirm;
  const isFormValid =
    email &&
    isPasswordValid &&
    passwordsMatch &&
    username.length >= 3 &&
    usernameAvailable === true &&
    phone.length >= 7 &&
    phoneAvailable !== false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) { toast.error("Password must be at least 6 characters"); return; }
    if (!passwordsMatch) { toast.error("Passwords don't match"); return; }
    if (usernameAvailable === false) { toast.error("Username already taken"); return; }
    if (phoneAvailable === false) { toast.error("This phone number is already registered."); return; }

    setLoading(true);
    const { error, needsConfirmation } = await signUpWithEmail(email, password);

    if (error) {
      setLoading(false);
      const msg = error.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already been registered")) {
        toast.error("Email already registered");
      } else if (msg.includes("valid email") || msg.includes("invalid")) {
        toast.error("Invalid email address");
      } else if (msg.includes("password")) {
        toast.error("Password must be at least 6 characters");
      } else {
        toast.error(error.message);
      }
      return;
    }

    // Insert profile data
    if (!needsConfirmation) {
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (newUser) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: newUser.id,
          username,
          phone,
        });
        if (profileError) {
          console.error("Profile creation error:", profileError);
          toast.error("Account created but profile setup failed. Please update your profile later.");
        }
      }
    }

    setLoading(false);
    if (needsConfirmation) {
      navigate("/signin");
    } else {
      navigate("/dashboard/new-analysis");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 h-[400px] w-[500px] rounded-full bg-primary/8 blur-[100px]" />
      </div>

      <Card className="relative w-full max-w-md border-border/60 bg-card/90 backdrop-blur">
        <CardHeader className="items-center pb-2">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <Logo size={40} />
            <span className="font-heading text-xl font-bold">SolarMap AI</span>
          </Link>
          <p className="text-sm text-muted-foreground">Create your account</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" onClick={signInWithGoogle}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="solaruser"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                required
                minLength={3}
              />
              {username.length >= 3 && (
                <p className={`text-xs flex items-center gap-1 ${usernameChecking ? "text-muted-foreground" : usernameAvailable ? "text-green-500" : "text-destructive"}`}>
                  {usernameChecking ? (
                    <><Loader2 className="h-3 w-3 animate-spin" /> Checking...</>
                  ) : usernameAvailable ? (
                    <><Check className="h-3 w-3" /> Username available ✓</>
                  ) : (
                    <><X className="h-3 w-3" /> Username already taken</>
                  )}
                </p>
              )}
              {username.length > 0 && username.length < 3 && (
                <p className="text-xs text-muted-foreground">Username must be at least 3 characters</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9+\-\s()]/g, ""))}
                required
              />
              {phone.length >= 7 && phoneAvailable === false && !phoneChecking && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <X className="h-3 w-3" /> This phone number is already registered.
                </p>
              )}
              {phoneChecking && phone.length >= 7 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Checking...
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className={`text-xs ${password.length > 0 && !isPasswordValid ? "text-destructive" : "text-muted-foreground"}`}>
                Password must be at least 6 characters.
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Input id="confirm" type={showConfirm ? "text" : "password"} placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="pr-10" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirm.length > 0 && !passwordsMatch && (
                <p className="text-xs text-destructive">Passwords don't match.</p>
              )}
            </div>

            <Button type="submit" disabled={loading || !isFormValid} className="w-full bg-gradient-to-r from-primary to-solar-amber text-primary-foreground">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
