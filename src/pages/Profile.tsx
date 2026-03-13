import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { User, Shield, LogOut, Trash2, Save, Mail, Key, Calendar, Phone, AtSign, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { t, language, setLanguage, languageNames, persistLanguageToProfile } = useLanguage();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || user?.email?.split("@")[0] || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [profileUsername, setProfileUsername] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);

  const provider = user?.app_metadata?.provider || "email";
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";
  const initials = displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U";

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("username, phone")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setProfileUsername(data.username || "");
        setProfilePhone(data.phone || "");
      }
      setProfileLoading(false);
    }
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: displayName },
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated successfully");
    }
  };

  const handleLanguageChange = async (value: string) => {
    const lang = value as Language;
    setLanguage(lang);
    await persistLanguageToProfile(lang);
    toast.success("Language updated");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      if (user) {
        await supabase.from("analyses").delete().eq("user_id", user.id);
        await supabase.from("profiles").delete().eq("id", user.id);
      }
      await signOut();
      toast.success("Account deletion requested. You have been logged out.");
      navigate("/");
    } catch {
      toast.error("Failed to delete account. Please contact support.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">{t("profile.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("profile.subtitle")}</p>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border/60 bg-card/80 backdrop-blur overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-primary to-solar-amber" />
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-10">
              <Avatar className="h-20 w-20 border-4 border-card shadow-lg">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left pb-1">
                <h2 className="font-heading text-xl font-bold">{displayName || user?.email?.split("@")[0]}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {profileUsername && (
                  <p className="text-sm text-muted-foreground">@{profileUsername}</p>
                )}
              </div>
              <Badge variant="secondary" className="sm:ml-auto capitalize">
                {provider === "google" ? "Google Account" : "Email Account"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Language Preferences */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-border/60 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-primary" /> {t("profile.languagePreferences")}
            </CardTitle>
            <CardDescription>{t("profile.languagePreferencesDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>{t("profile.preferredLanguage")}</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(languageNames) as Language[]).map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {languageNames[lang]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border/60 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" /> {t("profile.personalInfo")}
            </CardTitle>
            <CardDescription>{t("profile.updateDetails")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("profile.displayName")}</Label>
              <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("profile.email")}</Label>
              <Input id="email" value={user?.email || ""} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">{t("profile.emailCannotChange")}</p>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving} className="bg-gradient-to-r from-primary to-solar-amber text-primary-foreground">
              <Save className="mr-2 h-4 w-4" />
              {saving ? t("profile.saving") : t("profile.saveChanges")}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-border/60 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" /> {t("profile.accountDetails")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileUsername && (
              <>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <AtSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{t("profile.username")}</p>
                      <p className="text-xs text-muted-foreground">@{profileUsername}</p>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("profile.email")}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>
            <Separator />
            {profilePhone && (
              <>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{t("profile.phone")}</p>
                      <p className="text-xs text-muted-foreground">{profilePhone}</p>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("profile.provider")}</p>
                  <p className="text-xs text-muted-foreground capitalize">{provider}</p>
                </div>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("profile.memberSince")}</p>
                  <p className="text-xs text-muted-foreground">{memberSince}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-border/60 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-destructive" /> {t("profile.security")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> {t("profile.signOut")}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" /> {t("profile.deleteAccount")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("profile.deleteConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("profile.deleteConfirmDesc")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("profile.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? t("profile.deleting") : t("profile.deleteAccount")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
