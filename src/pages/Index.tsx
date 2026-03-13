import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Brain, BarChart3, FileText, Zap, MapPin, Sparkles, Download,
  CloudRain, HelpCircle, DollarSign, ShieldAlert,
  Satellite, TrendingUp, Cpu, ArrowRight,
  Sun, Leaf,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import heroSolarBg from "@/assets/hero-solar-bg.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const featureIcons = [Brain, Zap, BarChart3, FileText];
const problemIcons = [HelpCircle, ShieldAlert, DollarSign, CloudRain];
const whyIcons = [Satellite, TrendingUp, Cpu];
const stepIcons = [MapPin, Sparkles, Download];
const stepNums = ["01", "02", "03"];

export default function Index() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  // Parallax scroll listener — disabled on mobile for performance
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleCTA = () => navigate(user ? "/dashboard/new-analysis" : "/signin");

  const featureKeys = [
    { title: "features.aiAnalysis", desc: "features.aiAnalysisDesc" },
    { title: "features.smartPanel", desc: "features.smartPanelDesc" },
    { title: "features.energyForecasting", desc: "features.energyForecastingDesc" },
    { title: "features.reports", desc: "features.reportsDesc" },
  ];

  const problemKeys = [
    { title: "problems.uncertain", desc: "problems.uncertainDesc" },
    { title: "problems.complex", desc: "problems.complexDesc" },
    { title: "problems.financial", desc: "problems.financialDesc" },
    { title: "problems.climate", desc: "problems.climateDesc" },
  ];

  const whyKeys = [
    { title: "why.realData", desc: "why.realDataDesc" },
    { title: "why.trends", desc: "why.trendsDesc" },
    { title: "why.ml", desc: "why.mlDesc" },
  ];

  const stepKeys = [
    { title: "how.step1", desc: "how.step1Desc" },
    { title: "how.step2", desc: "how.step2Desc" },
    { title: "how.step3", desc: "how.step3Desc" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section id="hero" className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
          style={{
            backgroundImage: `url(${heroSolarBg})`,
            transform: `translateY(${scrollY * 0.4}px)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, rgba(0,0,0,0.78), rgba(0,0,0,0.50) 50%, rgba(0,0,0,0.35))`,
          }}
        />
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background: `linear-gradient(to right, rgba(2,6,23,0.88), rgba(2,6,23,0.60) 50%, rgba(2,6,23,0.40))`,
          }}
        />

        <div className="container relative z-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* LEFT — Text */}
            <div className="text-left">
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-white/90 mb-8">
                <Sparkles className="h-3.5 w-3.5" /> {t("hero.badge")}
              </motion.div>
              <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
                className="max-w-xl font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl text-white">
                {t("hero.headline")}{" "}
                <span className="bg-gradient-to-r from-primary to-solar-amber bg-clip-text text-transparent">{t("hero.headlineHighlight")}</span>
              </motion.h1>
              <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
                className="mt-6 max-w-lg text-lg text-white/75">
                {t("hero.description")}
              </motion.p>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
                className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button onClick={handleCTA} size="lg" className="bg-gradient-to-r from-primary to-solar-amber text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all text-base px-10 rounded-full">
                  {t("hero.ctaPrimary")} →
                </Button>
                <Button
                  onClick={() => navigate("/signin")}
                  size="lg"
                  variant="outline"
                  className="text-white transition-all text-base px-10 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.6)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                    e.currentTarget.style.borderColor = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)";
                  }}
                >
                  {t("hero.ctaSecondary")}
                </Button>
              </motion.div>
            </div>

            {/* RIGHT — Dashboard preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="rounded-2xl border border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                    <span className="ml-3 text-xs font-medium text-white/60">{t("hero.dashboardTitle")}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="rounded-xl bg-white/10 dark:bg-white/5 p-4">
                      <p className="text-xs text-white/50 mb-1">{t("hero.scoreLabel")}</p>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-primary">92</span>
                        <span className="text-xs text-green-400 mb-1">/ 100</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-primary to-solar-amber" />
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/10 dark:bg-white/5 p-4">
                      <p className="text-xs text-white/50 mb-1">{t("hero.monthlyOutput")}</p>
                      <span className="text-3xl font-bold text-white">847</span>
                      <span className="text-sm text-white/50 ml-1">kWh</span>
                      <div className="mt-2 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-green-400">+12% vs avg</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/10 dark:bg-white/5 p-4 mb-4">
                    <p className="text-xs text-white/50 mb-3">Energy Production (kWh)</p>
                    <div className="flex items-end gap-1 h-20">
                      {[40, 55, 48, 70, 85, 78, 92, 88, 95, 80, 72, 65].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary/60 to-solar-amber/80" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-white/30">Jan</span>
                      <span className="text-[10px] text-white/30">Dec</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/10 dark:bg-white/5 p-4">
                    <p className="text-xs text-white/50 mb-1">{t("hero.roiLabel")}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">₹1.8L</span>
                      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">+21% yearly</span>
                    </div>
                  </div>
                </div>

                {/* Floating card 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute -left-8 top-16 rounded-xl border border-white/10 bg-white/15 dark:bg-white/10 backdrop-blur-xl p-4 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-solar-amber flex items-center justify-center">
                      <Sun className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">{t("hero.suitabilityLabel")}</p>
                      <p className="text-sm font-bold text-white">{t("hero.suitabilityValue")}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating card 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                  className="absolute -right-6 bottom-20 rounded-xl border border-white/10 bg-white/15 dark:bg-white/10 backdrop-blur-xl p-4 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                      <Leaf className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">{t("hero.savingsLabel")}</p>
                      <p className="text-sm font-bold text-white">{t("hero.savingsValue")}</p>
                      <p className="text-xs text-green-400">{t("hero.savingsChange")}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-muted/30 py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t("features.title")}</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">{t("features.subtitle")}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featureKeys.map((f, i) => {
              const Icon = featureIcons[i];
              return (
                <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card className="group h-full border-border/60 bg-card/80 backdrop-blur hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all">
                    <CardContent className="p-6">
                      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-solar-amber/15 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-heading text-lg font-semibold mb-2">{t(f.title)}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t(f.desc)}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problems" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t("problems.title")}</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">{t("problems.subtitle")}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {problemKeys.map((p, i) => {
              const Icon = problemIcons[i];
              return (
                <motion.div key={p.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card className="h-full border-border/60 bg-card/80 backdrop-blur hover:border-destructive/30 hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-heading text-lg font-semibold mb-2">{t(p.title)}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t(p.desc)}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section id="technology" className="border-t bg-muted/30 py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t("why.title")}</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">{t("why.subtitle")}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {whyKeys.map((w, i) => {
              const Icon = whyIcons[i];
              return (
                <motion.div key={w.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card className="h-full border-border/60 bg-card/80 backdrop-blur hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all">
                    <CardContent className="p-8 text-center">
                      <div className="mb-4 mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-solar-amber text-primary-foreground shadow-lg shadow-primary/25">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-heading text-xl font-semibold mb-2">{t(w.title)}</h3>
                      <p className="text-muted-foreground leading-relaxed">{t(w.desc)}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t("how.title")}</h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">{t("how.subtitle")}</p>
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {stepKeys.map((s, i) => {
              const Icon = stepIcons[i];
              return (
                <motion.div key={s.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="relative text-center">
                  <span className="font-heading text-6xl font-bold bg-gradient-to-b from-primary/20 to-transparent bg-clip-text text-transparent">{stepNums[i]}</span>
                  <div className="mt-2 mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-solar-amber text-primary-foreground shadow-lg shadow-primary/25">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-heading text-xl font-semibold">{t(s.title)}</h3>
                  <p className="mt-2 text-muted-foreground">{t(s.desc)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta-section" className="bg-gradient-to-r from-primary to-solar-amber py-20">
        <div className="container text-center">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="font-heading text-3xl font-bold sm:text-4xl text-primary-foreground">
            {t("cta.title")}
          </motion.h2>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="mt-4 text-primary-foreground/80 max-w-xl mx-auto text-lg">
            {t("cta.subtitle")}
          </motion.p>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2} className="mt-8">
            <Button onClick={handleCTA} size="lg" variant="secondary" className="text-base px-10 rounded-full shadow-lg">
              {t("cta.button")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
