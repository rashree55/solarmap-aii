import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, LocateFixed } from "lucide-react";

const FLASK_API_URL = "http://127.0.0.1:5000/solar";
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface GeoSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export default function NewAnalysis() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [location, setLocation]       = useState("");
  const [latitude, setLatitude]       = useState("");
  const [longitude, setLongitude]     = useState("");
  const [siteType, setSiteType]       = useState("");
  const [obstruction, setObstruction] = useState("");
  const [roofArea, setRoofArea]       = useState("");
  const [budget, setBudget]           = useState("");
  const [monthlyBill, setMonthlyBill] = useState("");

  const [submitting, setSubmitting]           = useState(false);
  const [statusMsg, setStatusMsg]             = useState("");
  const [detecting, setDetecting]             = useState(false);
  const [suggestions, setSuggestions]         = useState<GeoSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const wrapperRef  = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    try {
      const res = await fetch(
        `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`,
        { headers: { "Accept": "application/json", "User-Agent": "SolarMapAI/1.0" } }
      );
      const data: GeoSuggestion[] = await res.json();
      setSuggestions(data || []);
      setShowSuggestions(true);
    } catch { setSuggestions([]); }
  }, []);

  const handleLocationChange = (val: string) => {
    setLocation(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 500);
  };

  const selectSuggestion = (s: GeoSuggestion) => {
    setLocation(s.display_name);
    setLatitude(parseFloat(s.lat).toFixed(5));
    setLongitude(parseFloat(s.lon).toFixed(5));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(5));
        setLongitude(pos.coords.longitude.toFixed(5));
        setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setDetecting(false);
        toast.success("Location detected");
      },
      () => { setDetecting(false); toast.error("Unable to detect location."); }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!latitude || !longitude) { toast.error("Please select a location."); return; }
    if (!siteType)    { toast.error("Please select roof tilt."); return; }
    if (!obstruction) { toast.error("Please select roof condition."); return; }
    if (!roofArea || parseFloat(roofArea) <= 0) { toast.error("Please enter valid roof area."); return; }
    if (!budget)      { toast.error("Please select a budget."); return; }
    if (!monthlyBill || parseFloat(monthlyBill) <= 0) { toast.error("Please enter monthly bill."); return; }
    if (!user)        { toast.error("You must be logged in."); return; }

    setSubmitting(true);
    setStatusMsg("Calling AI model...");

    try {
      // Step 1 — Call Flask
      const payload = {
        lat:            parseFloat(latitude),
        lon:            parseFloat(longitude),
        roof_area:      parseFloat(roofArea),
        budget,
        monthly_bill:   parseFloat(monthlyBill),
        tilt:           siteType,
        roof_condition: obstruction,
      };
      console.log("→ Sending to Flask:", payload);

      const res = await fetch(FLASK_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || `Flask error ${res.status}`);
      }

      const apiData = await res.json();
      console.log("← Flask result:", apiData);
      if (apiData.error) throw new Error(apiData.error);

      // Step 2 — Save to Supabase
      setStatusMsg("Saving analysis...");

      const insertPayload = {
        user_id:            user.id,
        location_text:      location,
        latitude:           parseFloat(latitude),
        longitude:          parseFloat(longitude),
        roof_area:          parseFloat(roofArea),
        budget:             budget,
        monthly_bill:       parseFloat(monthlyBill),
        result:             apiData,
        panel_type:         apiData.panel_type,
        num_panels:         apiData.num_panels,
        system_capacity_kw: apiData.system_capacity_kw,
        annual_energy_kwh:  apiData.annual_energy_kwh,
        annual_ghi_kwh:     apiData.annual_ghi_kwh,
      };

      console.log("→ Inserting to Supabase:", insertPayload);

      // Use direct REST API to avoid Supabase auth lock contention
      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/analysis_results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "Prefer": "return=representation",
        },
        body: JSON.stringify(insertPayload),
      });

      if (!insertRes.ok) {
        const errBody = await insertRes.json().catch(() => ({}));
        console.error("Insert error:", errBody);
        toast.error(`Save failed: ${errBody?.message || insertRes.status}`, { duration: 10000 });
        setSubmitting(false);
        setStatusMsg("");
        return;
      }

      const rows = await insertRes.json();
      const savedId = rows?.[0]?.id;
      console.log("✅ Saved! Row id:", savedId);
      toast.success("Analysis complete! 🎉");
      navigate("/dashboard/results", { state: { id: savedId } });

    } catch (err: unknown) {
      console.error("Submit error:", err);
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        toast.error("Cannot reach Flask. Make sure it's running on port 5000.");
      } else {
        toast.error(`Error: ${msg}`, { duration: 10000 });
      }
    } finally {
      setSubmitting(false);
      setStatusMsg("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">New Solar Analysis</CardTitle>
          <CardDescription>Enter your site details and let AI evaluate solar potential.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* LOCATION */}
            <div className="space-y-2" ref={wrapperRef}>
              <Label>Location / Address *</Label>
              <div className="relative">
                <Input
                  placeholder="Type a place or address in Maharashtra..."
                  value={location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-md border border-border bg-popover shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => selectSuggestion(s)}
                      >
                        {s.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button type="button" variant="outline" onClick={detectLocation} disabled={detecting}>
                {detecting
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Detecting...</>
                  : <><LocateFixed className="mr-2 h-4 w-4" />Detect My Location</>
                }
              </Button>

              {(latitude || longitude) && (
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Latitude</Label>
                    <Input readOnly value={latitude} className="font-mono text-sm bg-muted/40" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Longitude</Label>
                    <Input readOnly value={longitude} className="font-mono text-sm bg-muted/40" />
                  </div>
                </div>
              )}
            </div>

            {/* TILT + ROOF CONDITION */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Roof Tilt *</Label>
                <Select value={siteType} onValueChange={setSiteType}>
                  <SelectTrigger><SelectValue placeholder="Select tilt" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="low_slope">Low Slope</SelectItem>
                    <SelectItem value="medium_slope">Medium Slope</SelectItem>
                    <SelectItem value="steep">Steep</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Roof Condition *</Label>
                <Select value={obstruction} onValueChange={setObstruction}>
                  <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ROOF AREA + BUDGET + MONTHLY BILL */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Roof Area (m²) *</Label>
                <Input
                  type="number"
                  placeholder="e.g. 120"
                  value={roofArea}
                  onChange={(e) => setRoofArea(e.target.value)}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label>Budget *</Label>
                <Select value={budget} onValueChange={setBudget}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (&lt;₹1L)</SelectItem>
                    <SelectItem value="medium">Medium (₹1–3L)</SelectItem>
                    <SelectItem value="high">High (&gt;₹3L)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Monthly Bill (₹) *</Label>
                <Input
                  type="number"
                  placeholder="e.g. 3000"
                  value={monthlyBill}
                  onChange={(e) => setMonthlyBill(e.target.value)}
                  min="1"
                />
              </div>
            </div>

            {/* SUBMIT */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-primary to-solar-amber text-primary-foreground shadow-lg shadow-primary/25"
            >
              {submitting
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{statusMsg || "Analyzing..."}</>
                : "Run Solar Analysis →"
              }
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
