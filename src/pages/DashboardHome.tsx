import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Sun, TrendingUp, FileText, Zap, BarChart3, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

interface RecentAnalysis {
  id: string;
  location_text: string;
  panel_type: string;
  annual_energy_kwh: number;
  annual_ghi_kwh: number;
  system_capacity_kw: number;
  created_at: string;
}

export default function DashboardHome() {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";

  const [recent, setRecent] = useState<RecentAnalysis[]>([]);
  const [statsData, setStatsData] = useState({
    count: 0,
    totalEnergy: 0,
    totalSavings: 0,
    totalCapacity: 0,
  });

  useEffect(() => {
    if (!user) return;

    // Direct REST call — no Supabase client lock
    fetch(
      `${SUPABASE_URL}/rest/v1/analysis_results?select=id,location_text,panel_type,annual_energy_kwh,annual_ghi_kwh,system_capacity_kw,created_at&user_id=eq.${user.id}&order=created_at.desc&limit=5`,
      {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    )
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        setRecent(data);
        const count = data.length;
        const totalEnergy  = data.reduce((s, a) => s + (a.annual_energy_kwh || 0), 0);
        const totalSavings = Math.round(totalEnergy * 7);   // ₹7/kWh
        const totalCapacity = data.reduce((s, a) => s + (a.system_capacity_kw || 0), 0);
        setStatsData({ count, totalEnergy, totalSavings, totalCapacity });
      })
      .catch(console.error);
  }, [user]);

  const stats = [
    {
      icon: Sun,
      label: "Total Analyses",
      value: String(statsData.count),
      desc: "Solar assessments run",
      gradient: "from-primary/15 to-solar-amber/15",
    },
    {
      icon: TrendingUp,
      label: "Total Capacity",
      value: statsData.count ? `${statsData.totalCapacity.toFixed(1)} kW` : "0 kW",
      desc: "Combined system capacity",
      gradient: "from-emerald-500/15 to-teal-500/15",
    },
    {
      icon: Zap,
      label: "Energy Generated",
      value: statsData.totalEnergy ? `${Math.round(statsData.totalEnergy).toLocaleString()} kWh` : "0 kWh",
      desc: "Total estimated output",
      gradient: "from-blue-500/15 to-cyan-500/15",
    },
    {
      icon: BarChart3,
      label: "Est. Savings",
      value: statsData.totalSavings ? `₹${statsData.totalSavings.toLocaleString()}` : "₹0",
      desc: "Projected annual savings",
      gradient: "from-violet-500/15 to-purple-500/15",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-primary to-solar-amber bg-clip-text text-transparent">
            {displayName}
          </span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Start a new solar analysis or review previous results.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <Button
          asChild
          size="lg"
          className="bg-gradient-to-r from-primary to-solar-amber text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
        >
          <Link to="/dashboard/new-analysis">
            <PlusCircle className="mr-2 h-5 w-5" /> Start New Analysis
          </Link>
        </Button>
      </motion.div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
            <Card className="border-border/60 bg-card/80 backdrop-blur hover:shadow-lg hover:shadow-primary/5 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent analyses */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold">Recent Analyses</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/history" className="text-muted-foreground hover:text-foreground">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>

        {recent.length === 0 ? (
          <Card className="border-dashed border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-solar-amber/10">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="font-heading text-lg font-semibold mb-1">No analyses yet</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                Run your first solar analysis to see results, energy forecasts, and savings projections here.
              </p>
              <Button asChild className="bg-gradient-to-r from-primary to-solar-amber text-primary-foreground">
                <Link to="/dashboard/new-analysis">
                  <PlusCircle className="mr-2 h-4 w-4" /> Run First Analysis
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recent.map((a) => {
              const savings = Math.round((a.annual_energy_kwh || 0) * 7);
              return (
                <Card key={a.id} className="border-border/60 bg-card/80 backdrop-blur hover:border-primary/30 transition-all">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{a.location_text}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-primary font-semibold">
                        {Number(a.system_capacity_kw).toFixed(1)} kW
                      </span>
                      <span>{Math.round(a.annual_energy_kwh).toLocaleString()} kWh</span>
                      <span className="text-green-500">₹{savings.toLocaleString()}</span>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/dashboard/results" state={{ id: a.id }}>View</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
