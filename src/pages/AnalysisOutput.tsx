import { useLocation, Link, Navigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cpu, Zap, Sun, Download, Loader2, BarChart3 } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ── TYPES — matches flat Supabase columns exactly ─────────────────────────────
interface AnalysisData {
  id: string;
  location_text: string;
  roof_area: number;
  budget: string;
  monthly_bill: number;
  created_at: string;
  // Flat result columns written by NewAnalysis.tsx
  panel_type: string;
  num_panels: number;
  system_capacity_kw: number;
  annual_energy_kwh: number;
  annual_ghi_kwh: number;
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function AnalysisOutput() {
  const { state } = useLocation();
  const [searchParams] = useSearchParams();

  // Accept id from router state OR ?id= query param
  const analysisId = state?.id || searchParams.get("id");

  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!analysisId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("analysis_results")
        .select("*")
        .eq("id", analysisId)
        .single();

      if (error || !data) {
        console.error("Supabase fetch error:", error);
        setNotFound(true);
      } else {
        setAnalysis(data as AnalysisData);
      }
      setLoading(false);
    };

    fetchData();
  }, [analysisId]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading your analysis...</p>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (notFound || !analysis) {
    return <Navigate to="/dashboard/new-analysis" replace />;
  }

  // Estimated annual savings ₹7/kWh
  const annualSavings = Math.round(analysis.annual_energy_kwh * 7);

  const cards = [
    {
      icon: Sun,
      label: "Panels Required",
      value: analysis.num_panels,
      unit: "panels",
      color: "text-orange-500",
    },
    {
      icon: Cpu,
      label: "Recommended Panel",
      value: analysis.panel_type,
      unit: "",
      color: "text-orange-500",
    },
    {
      icon: Zap,
      label: "Annual Energy",
      value: `${Math.round(analysis.annual_energy_kwh).toLocaleString()} kWh`,
      unit: "",
      color: "text-orange-500",
    },
    {
      icon: BarChart3,
      label: "System Capacity",
      value: `${Number(analysis.system_capacity_kw).toFixed(2)} kW`,
      unit: "",
      color: "text-green-500",
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Analysis Results</h1>
          <p className="text-muted-foreground text-sm mt-1">{analysis.location_text}</p>
          <p className="text-muted-foreground text-xs mt-0.5">
            {new Date(analysis.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-solar-amber text-primary-foreground">
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>

      {/* Result cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {c.label}
              </CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              {c.unit && <p className="text-xs text-muted-foreground mt-0.5">{c.unit}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Annual GHI</span>
              <span className="font-medium">
                {Math.round(analysis.annual_ghi_kwh).toLocaleString()} kWh/m²
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Annual Savings</span>
              <span className="font-medium text-green-600">
                ₹{annualSavings.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Roof Area</span>
              <span className="font-medium">{analysis.roof_area} m²</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budget Category</span>
              <span className="font-medium capitalize">{analysis.budget}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Bill</span>
              <span className="font-medium">₹{analysis.monthly_bill?.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
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
