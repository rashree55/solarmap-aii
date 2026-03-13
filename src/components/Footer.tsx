import { Link, useNavigate, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const footerLinks = [
    { key: "navbar.home", href: "#hero" },
    { key: "navbar.features", href: "#features" },
    { key: "navbar.technology", href: "#technology" },
    { key: "navbar.about", href: "/about" },
  ];

  const handleClick = (href: string) => {
    if (href.startsWith("/")) {
      navigate(href);
      return;
    }
    if (location.pathname !== "/") {
      navigate("/" + href);
      return;
    }
    document.getElementById(href.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border/40 bg-muted/20 py-12">
      <div className="container grid gap-8 md:grid-cols-3">
        <div className="space-y-3">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={28} />
            <span className="font-heading text-base font-bold">
              Solar<span className="text-primary">Map</span> AI
            </span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            {t("footer.description")}
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-heading text-sm font-semibold">{t("footer.navigation")}</h4>
          <ul className="space-y-2">
            {footerLinks.map((l) => (
              <li key={l.key}>
                <button onClick={() => handleClick(l.href)} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t(l.key)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-heading text-sm font-semibold">{t("footer.contact")}</h4>
          <p className="text-sm text-muted-foreground">hello@solarmap.ai</p>
          <p className="text-sm text-muted-foreground">San Francisco, CA</p>
        </div>
      </div>

      <div className="container mt-8 pt-6 border-t border-border/40">
        <p className="text-center text-xs text-muted-foreground">
          {t("footer.copyright")}
        </p>
      </div>
    </footer>
  );
}
