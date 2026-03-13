import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Lightbulb, Rocket, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const sections = [
  {
    icon: Target,
    title: "Our Mission",
    text: "SolarMap AI exists to democratize solar energy analysis. We believe every homeowner and business should have access to accurate, data-driven insights to make confident solar investment decisions — without needing expensive consultants or complex tools.",
  },
  {
    icon: Lightbulb,
    title: "How SolarMap AI Works",
    text: "Our platform combines NASA POWER satellite climate data with machine learning models trained on thousands of solar installations. By analyzing over 10 years of irradiance, temperature, and weather data alongside your site-specific conditions, we deliver precise solar feasibility assessments in seconds.",
  },
  {
    icon: Rocket,
    title: "Why We Built This",
    text: "The solar industry lacks accessible, intelligent tools for everyday decision-makers. Traditional solar assessments are slow, expensive, and often inaccurate. We built SolarMap AI to bridge this gap — providing instant, AI-powered analysis that helps accelerate the global transition to clean energy.",
  },
];

export default function About() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-24">
        <div className="container max-w-4xl">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="text-center mb-16">
            <h1 className="font-heading text-4xl font-bold sm:text-5xl">
              About <span className="bg-gradient-to-r from-primary to-solar-amber bg-clip-text text-transparent">SolarMap AI</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Empowering smarter solar decisions with artificial intelligence and real climate data.
            </p>
          </motion.div>

          <div className="space-y-8">
            {sections.map((s, i) => (
              <motion.div key={s.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="border-border/60 bg-card/80 backdrop-blur">
                  <CardContent className="p-8 flex gap-6 items-start">
                    <div className="shrink-0 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-solar-amber/15 text-primary">
                      <s.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="font-heading text-xl font-semibold mb-2">{s.title}</h2>
                      <p className="text-muted-foreground leading-relaxed">{s.text}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3} className="mt-16 text-center">
            <h3 className="font-heading text-2xl font-bold mb-4">Ready to analyze your solar potential?</h3>
            <Button
              size="lg"
              onClick={() => navigate(user ? "/dashboard/new-analysis" : "/signin")}
              className="bg-gradient-to-r from-primary to-solar-amber text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 rounded-full px-10"
            >
              Start Your Analysis <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
