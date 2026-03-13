import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, MapPin, Sun, Zap, DollarSign, PlusCircle, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

interface Analysis {
  id: string;
  location_text: string;
  suitability_score: number;
  recommended_panel: string;
  annual_energy: number;
  annual_savings: number;
  created_at: string;
}

export default function AnalysisHistory() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("analyses")
      .select("id, location_text, suitability_score, recommended_panel, annual_energy, annual_savings, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setAnalyses(data);
        setLoading(false);
      });
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
          <Link to="/dashboard/new-analysis"><PlusCircle className="mr-2 h-4 w-4" /> New Analysis</Link>
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
              <Link to="/dashboard/new-analysis"><PlusCircle className="mr-2 h-4 w-4" /> Start New Analysis</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {analyses.map((a, i) => (
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
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[180px]">{a.location_text}</span>
                    </div>
                    <Badge variant={a.suitability_score >= 80 ? "default" : "secondary"} className="text-xs">
                      {a.suitability_score}%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Sun className="h-3.5 w-3.5 text-primary" />
                      <span className="text-muted-foreground">{a.recommended_panel}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      <span>{a.annual_energy.toLocaleString()} kWh</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-green-500" />
                      <span>${a.annual_savings.toLocaleString()}/yr</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">
                        {new Date(a.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link to={`/dashboard/results?id=${a.id}`}>View Report</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
