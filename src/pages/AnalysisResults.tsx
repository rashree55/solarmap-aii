import { useLocation, Link, Navigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sun, Zap, Cpu, Download, Loader2, BarChart3, Leaf, TreePine, IndianRupee, TrendingUp, ShieldCheck } from "lucide-react";
import { generatePDF } from "@/lib/generatePDF";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface AnalysisData {
  id: string;
  location_text: string;
  roof_area: number;
  monthly_bill: number;
  created_at: string;
  // Core
  panel_type: string;
  num_panels: number;
  system_capacity_kw: number;
  annual_energy_kwh: number;
  annual_ghi_kwh: number;
  // Financial
  installation_cost: number;
  subsidy: number;
  net_cost: number;
  payback_years: number;
  savings_25yr: number;
  bill_coverage_pct: number;
  // Environmental
  co2_avoided_tonnes: number;
  trees_equivalent: number;
  // Suitability
  suitability_rating: string;
  suitability_score: number;
  suitability_advice: string;
}

export default function AnalysisResults() {
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const analysisId = state?.id || searchParams.get("id");

  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!analysisId) { setNotFound(true); setLoading(false); return; }

    fetch(
      `${SUPABASE_URL}/rest/v1/analysis_results?id=eq.${analysisId}&limit=1`,
      {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    )
      .then(r => r.json())
      .then(rows => {
        if (!Array.isArray(rows) || rows.length === 0) setNotFound(true);
        else setAnalysis(rows[0] as AnalysisData);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [analysisId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading your analysis...</p>
      </div>
    );
  }

  if (notFound || !analysis) return <Navigate to="/dashboard/new-analysis" replace />;

  // Suitability badge color
  const suitabilityColor = {
    "HIGHLY SUITABLE":    "bg-green-500/15 text-green-600 border-green-500/30",
    "SUITABLE":           "bg-blue-500/15 text-blue-600 border-blue-500/30",
    "MARGINALLY SUITABLE": "bg-yellow-500/15 text-yellow-600 border-yellow-500/30",
    "NOT RECOMMENDED":    "bg-red-500/15 text-red-600 border-red-500/30",
    "UNSUITABLE":         "bg-red-500/15 text-red-600 border-red-500/30",
  }[analysis.suitability_rating] ?? "bg-muted text-muted-foreground";

  const topCards = [
    { icon: Sun,      label: "Panels Required",    value: `${analysis.num_panels}`,                                    sub: "panels",  color: "text-orange-500" },
    { icon: Cpu,      label: "Recommended Panel",  value: analysis.panel_type,                                         sub: "",        color: "text-orange-500" },
    { icon: Zap,      label: "Annual Energy",       value: `${Math.round(analysis.annual_energy_kwh).toLocaleString()} kWh`, sub: "",  color: "text-orange-500" },
    { icon: BarChart3, label: "System Capacity",   value: `${Number(analysis.system_capacity_kw).toFixed(2)} kW`,     sub: "",        color: "text-green-500"  },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Analysis Results</h1>
          <p className="text-muted-foreground text-sm mt-1">{analysis.location_text}</p>
          <p className="text-muted-foreground text-xs mt-0.5">
            {new Date(analysis.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Button onClick={() => generatePDF(analysis!)} className="bg-gradient-to-r from-primary to-solar-amber text-primary-foreground">
          <Download className="mr-2 h-4 w-4" /> Download Report
        </Button>
      </div>

      {/* ── Suitability banner ── */}
      {analysis.suitability_rating && (
        <div className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${suitabilityColor}`}>
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">{analysis.suitability_rating} — {analysis.suitability_score}/9 points</p>
            <p className="text-xs mt-0.5 opacity-80">{analysis.suitability_advice}</p>
          </div>
        </div>
      )}

      {/* ── Top 4 cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {topCards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              {c.sub && <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Financial Summary ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-primary" /> Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Installation Cost</span>
              <span className="font-medium">₹{Math.round(analysis.installation_cost).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">PM Surya Ghar Subsidy</span>
              <span className="font-medium text-green-600">− ₹{Math.round(analysis.subsidy).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Net Cost After Subsidy</span>
              <span className="font-bold">₹{Math.round(analysis.net_cost).toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payback Period</span>
              <span className="font-medium">{analysis.payback_years} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">25-Year Net Savings</span>
              <span className="font-medium text-green-600">₹{Math.round(analysis.savings_25yr).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bill Coverage</span>
              <span className="font-medium">{Number(analysis.bill_coverage_pct).toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Environmental Impact ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Leaf className="h-4 w-4 text-green-500" /> Environmental Impact
            <span className="text-xs text-muted-foreground font-normal">(over 25-year panel lifetime)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            <Leaf className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-green-600">{Number(analysis.co2_avoided_tonnes).toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-1">Tonnes of CO₂ avoided</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Source: CEA India 2023</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <TreePine className="h-8 w-8 text-emerald-600 mb-2" />
            <p className="text-2xl font-bold text-emerald-600">{Math.round(analysis.trees_equivalent).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Equivalent trees planted</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Source: US Forest Service</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <TrendingUp className="h-8 w-8 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-blue-600">{Math.round(analysis.annual_ghi_kwh).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">kWh/m² annual solar resource</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Source: NASA POWER</p>
          </div>
        </CardContent>
      </Card>

      {/* ── Site Summary ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Site Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Roof Area</span>
              <span className="font-medium">{analysis.roof_area} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Bill</span>
              <span className="font-medium">₹{analysis.monthly_bill?.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">System Capacity</span>
              <span className="font-medium">{Number(analysis.system_capacity_kw).toFixed(2)} kW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Annual Energy</span>
              <span className="font-medium">{Math.round(analysis.annual_energy_kwh).toLocaleString()} kWh</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Actions ── */}
      <div className="flex gap-3 flex-wrap">
        <Button asChild variant="outline">
          <Link to="/dashboard/new-analysis">Run Another Analysis</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/dashboard/history">View History</Link>
        </Button>
      </div>

    </div>
  );
}
