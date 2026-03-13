import { useLocation, Link, Navigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Zap, DollarSign, Cpu, Download, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { supabase } from "@/lib/supabase";
import { generatePDF } from "@/lib/generatePDF";

interface AnalysisData {
  id: string;
  location_text: string;
  site_type: string;
  obstruction_level: string;
  roof_area: number | null;
  budget: number | null;
  energy_usage: number | null;
  suitability_score: number;
  recommended_panel: string;
  annual_energy: number;
  annual_savings: number;
  monthly_production: { month: string; kWh: number }[];
  created_at: string;
}

export default function AnalysisResults() {
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get("id") || state?.analysisId;
  const [analysis, setAnalysis] = useState<AnalysisData | null>(state?.results ?? null);
  const [loading, setLoading] = useState(!state?.results && !!analysisId);

  useEffect(() => {
    if (!state?.results && analysisId) {
      supabase
        .from("analyses")
        .select("*")
        .eq("id", analysisId)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            setLoading(false);
            return;
          }
          setAnalysis(data as AnalysisData);
          setLoading(false);
        });
    }
  }, [analysisId, state?.results]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analysis) return <Navigate to="/dashboard/new-analysis" replace />;

  const monthlyData = analysis.monthly_production ?? [];

  const handleDownload = () => {
    generatePDF(analysis);
  };

  const cards = [
    { icon: Sun, label: "Suitability Score", value: `${analysis.suitability_score}%`, color: analysis.suitability_score >= 80 ? "text-green-500" : "text-primary" },
    { icon: Cpu, label: "Recommended Panel", value: analysis.recommended_panel, color: "text-primary" },
    { icon: Zap, label: "Annual Energy", value: `${analysis.annual_energy.toLocaleString()} kWh`, color: "text-primary" },
    { icon: DollarSign, label: "Annual Savings", value: `$${analysis.annual_savings.toLocaleString()}`, color: "text-green-500" },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Analysis Results</h1>
          <p className="text-muted-foreground">{analysis.location_text}</p>
        </div>
        <Button onClick={handleDownload} className="bg-gradient-to-r from-primary to-solar-amber text-primary-foreground">
          <Download className="mr-2 h-4 w-4" /> Download Report
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Monthly Energy Production Estimate</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
              <YAxis className="text-xs fill-muted-foreground" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Bar dataKey="kWh" fill="hsl(25, 95%, 53%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Button asChild variant="outline">
        <Link to="/dashboard/new-analysis">Run Another Analysis</Link>
      </Button>
    </div>
  );
}
