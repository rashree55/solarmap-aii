import { Link, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, LayoutDashboard, User, Menu, X, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t, languageNames, persistLanguageToProfile } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLanding = location.pathname === "/";

  const navLinks = [
    { key: "navbar.home", href: "#hero" },
    { key: "navbar.features", href: "#features" },
    { key: "navbar.technology", href: "#technology" },
    { key: "navbar.about", href: "/about" },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("/")) {
      navigate(href);
      return;
    }
    if (!isLanding) {
      navigate("/" + href);
      return;
    }
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = useCallback(() => {
    if (!isLanding) return;
    const sections = ["hero", "features", "problems", "technology", "how-it-works", "cta-section"];
    let current = "hero";
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 120) {
        current = id;
      }
    }
    setActiveSection(current);
  }, [isLanding]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const getActiveKey = () => {
    if (!isLanding) {
      if (location.pathname === "/about") return "navbar.about";
      return "";
    }
    if (activeSection === "hero") return "navbar.home";
    if (activeSection === "features" || activeSection === "problems") return "navbar.features";
    if (activeSection === "technology" || activeSection === "how-it-works" || activeSection === "cta-section") return "navbar.technology";
    return "";
  };

  const currentActiveKey = getActiveKey();
  const langs: Language[] = ["en", "hi", "mr"];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/60 dark:bg-background/40 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Left — Logo */}
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <Logo size={34} />
          <span className="font-heading text-lg font-bold tracking-tight">
            Solar<span className="text-primary">Map</span> AI
          </span>
        </Link>

        {/* Center — Glass Pill Nav (desktop) */}
        <nav className="hidden md:flex items-center">
          <div
            className="flex items-center gap-1 rounded-full px-5 py-2"
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <style>{`
              .dark .glass-pill-nav {
                background: rgba(15,23,42,0.6) !important;
              }
            `}</style>
            {navLinks.map((l) => (
              <button
                key={l.key}
                onClick={() => handleNavClick(l.href)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                  currentActiveKey === l.key
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                }`}
              >
                {t(l.key)}
              </button>
            ))}
          </div>
        </nav>

        
        <div className="hidden md:flex items-center gap-1">
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {langs.map((l) => (
                <DropdownMenuItem
                  key={l}
                  onClick={() => { setLanguage(l); persistLanguageToProfile(l); }}
                  className={language === l ? "bg-accent font-semibold" : ""}
                >
                  {languageNames[l]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-1 h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {user.email?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />{t("navbar.dashboard")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/profile"><User className="mr-2 h-4 w-4" />{t("navbar.profile")}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />{t("navbar.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="ml-2 bg-gradient-to-r from-primary to-solar-amber text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
              <Link to="/signin">{t("navbar.signIn")}</Link>
            </Button>
          )}
        </div>

        {/* Mobile — right side */}
        <div className="flex items-center gap-2 md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {langs.map((l) => (
                <DropdownMenuItem
                  key={l}
                  onClick={() => { setLanguage(l); persistLanguageToProfile(l); }}
                  className={language === l ? "bg-accent font-semibold" : ""}
                >
                  {languageNames[l]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <div className="container py-4 flex flex-col gap-2">
            {navLinks.map((l) => (
              <button
                key={l.key}
                onClick={() => handleNavClick(l.href)}
                className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentActiveKey === l.key ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t(l.key)}
              </button>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">{t("navbar.dashboard")}</Link>
                <button onClick={handleLogout} className="px-3 py-2 text-left text-sm font-medium text-destructive">{t("navbar.logout")}</button>
              </>
            ) : (
              <Button asChild size="sm" className="mt-2 bg-gradient-to-r from-primary to-solar-amber text-primary-foreground">
                <Link to="/signin" onClick={() => setMobileOpen(false)}>{t("navbar.signIn")}</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
