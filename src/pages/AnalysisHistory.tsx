import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, MapPin, Sun, Zap, PlusCircle, FileText, Loader2, BarChart3 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
import { motion } from "framer-motion";

interface Analysis {
  id: string;
  location_text: string;
  panel_type: string;
  num_panels: number;
  annual_energy_kwh: number;
  annual_ghi_kwh: number;
  system_capacity_kw: number;
  created_at: string;
}

export default function AnalysisHistory() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // Direct REST call to avoid Supabase auth lock
    fetch(
      `${SUPABASE_URL}/rest/v1/analysis_results?select=id,location_text,panel_type,num_panels,annual_energy_kwh,annual_ghi_kwh,system_capacity_kw,created_at&user_id=eq.${user.id}&order=created_at.desc`,
      {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    )
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setAnalyses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Analysis History</h1>
        <Button asChild className="bg-gradient-to-r from-primary to-solar-amber text-primary-foreground">
          <Link to="/dashboard/new-analysis">
            <PlusCircle className="mr-2 h-4 w-4" /> New Analysis
          </Link>
        </Button>
      </div>

      {analyses.length === 0 ? (
        <Card className="border-dashed border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-solar-amber/10">
              <History className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-heading text-lg font-semibold mb-1">No analyses yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              Run your first solar analysis to see results here.
            </p>
            <Button asChild className="bg-gradient-to-r from-primary to-solar-amber text-primary-foreground">
              <Link to="/dashboard/new-analysis">
                <PlusCircle className="mr-2 h-4 w-4" /> Start New Analysis
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {analyses.map((a, i) => {
            const annualSavings = Math.round(a.annual_energy_kwh * 7);
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-border/60 bg-card/80 backdrop-blur hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all h-full flex flex-col">
                  <CardContent className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate max-w-[180px]">{a.location_text}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Sun className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-muted-foreground truncate">{a.panel_type}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{Math.round(a.annual_energy_kwh).toLocaleString()} kWh</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/* ₹ symbol — no more $ */}
                        <span className="text-green-500 font-bold text-sm">₹</span>
                        <span className="text-green-600 font-medium">
                          {annualSavings.toLocaleString()}/yr
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground text-xs">
                          {new Date(a.created_at).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      {/* Link passes id via state so AnalysisResults can fetch it */}
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link to="/dashboard/results" state={{ id: a.id }}>
                          View Report
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
