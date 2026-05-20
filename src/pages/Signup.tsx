import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase"; // ✅ direct supabase
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        navigate("/dashboard", { replace: true });
      }
    };
    checkUser();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signup successful! Please login.");
      navigate("/signin");
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:8080/dashboard",
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center">
          <Logo size={40} />
          <p>Create your account</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button onClick={handleGoogleLogin} className="w-full">
            Continue with Google
          </Button>

          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Sign Up"}
            </Button>
          </form>

          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link to="/signin">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}