import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase"; // ✅ DIRECT SUPABASE
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ CHECK USER SESSION
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        navigate("/dashboard", { replace: true });
      }
    };
    checkUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Login successful!");
      navigate("/dashboard");
    }
  };

  // ✅ GOOGLE LOGIN FIXED
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:8080/dashboard", // ✅ IMPORTANT
      },
    });

    if (error) toast.error(error.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <Logo size={40} />
            <span className="text-xl font-bold">SolarMap AI</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* GOOGLE LOGIN */}
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
            Continue with Google
          </Button>

          <div className="text-center text-sm">OR</div>

          {/* EMAIL LOGIN */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm">
            Don’t have an account?{" "}
            <Link to="/signup">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}