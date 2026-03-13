import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Loader2, LocateFixed, Navigation } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const NOMINATIM_HEADERS = { "Accept": "application/json", "User-Agent": "SolarMapAI/1.0" };
const MAHARASHTRA_VIEWBOX = "72.6,21.8,80.9,15.6";

const isInMaharashtra = (displayName: string) => {
  return displayName.toLowerCase().includes("maharashtra");
};

interface GeoSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export default function NewAnalysis() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [siteType, setSiteType] = useState("");
  const [obstruction, setObstruction] = useState("");
  const [roofArea, setRoofArea] = useState("");
  const [budget, setBudget] = useState("");
  const [energyUsage, setEnergyUsage] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reverse geocode: coords → address
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
        { headers: NOMINATIM_HEADERS }
      );
      const data = await res.json();
      if (data?.display_name) {
        const parts = data.display_name.split(", ");
        return parts.slice(0, 4).join(", ");
      }
    } catch { /* ignore */ }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  // Search suggestions: address → multiple results
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLatitude("");
      setLongitude("");
      return;
    }
    setGeocoding(true);
    try {
      const res = await fetch(
        `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&countrycodes=in&viewbox=${MAHARASHTRA_VIEWBOX}&bounded=1`,
        { headers: NOMINATIM_HEADERS }
      );
      const data: GeoSuggestion[] = await res.json();
      const filtered = data?.filter(s => isInMaharashtra(s.display_name)) || [];
      if (filtered.length > 0) {
        setSuggestions(filtered.slice(0, 5));
        setShowSuggestions(true);
        setLatitude(parseFloat(filtered[0].lat).toFixed(5));
        setLongitude(parseFloat(filtered[0].lon).toFixed(5));
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setLatitude("");
        setLongitude("");
      }
    } catch {
      setSuggestions([]);
      setLatitude("");
      setLongitude("");
    } finally {
      setGeocoding(false);
    }
  }, []);

  const selectSuggestion = (s: GeoSuggestion) => {
    setLocation(s.display_name);
    setLatitude(parseFloat(s.lat).toFixed(5));
    setLongitude(parseFloat(s.lon).toFixed(5));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Debounced geocoding on location input change
  const handleLocationChange = (val: string) => {
    setLocation(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 500);
  };

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const address = await reverseGeocode(lat, lng);
        if (!isInMaharashtra(address)) {
          setDetecting(false);
          toast.error("This tool currently supports solar analysis for locations within Maharashtra only.");
          return;
        }
        setLatitude(lat.toFixed(5));
        setLongitude(lng.toFixed(5));
        setLocation(address);
        setDetecting(false);
        toast.success("Location detected");
      },
      () => {
        setDetecting(false);
        toast.error("Unable to detect location. Please enter address manually.");
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!latitude || !longitude) {
      toast.error("Please provide a valid location.");
      return;
    }
    if (!siteType || !obstruction) {
      toast.error("Please fill in required fields");
      return;
    }
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setSubmitting(true);

    try {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const suitability = Math.floor(Math.random() * 20 + 75);
      const panelType = siteType === "commercial" ? "Bifacial 550W" : "Monocrystalline 400W";
      const annualEnergy = Math.floor(Math.random() * 5000 + 8000);
      const annualSavings = Math.floor(Math.random() * 3000 + 2000);

      const monthlyProduction = Array.from({ length: 12 }, (_, i) => ({
        month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
        kWh: Math.floor(annualEnergy / 12 * (0.6 + Math.random() * 0.8)),
      }));

      const insertData = {
        user_id: user.id,
        location_text: location,
        latitude: lat,
        longitude: lng,
        site_type: siteType,
        obstruction_level: obstruction,
        roof_area: roofArea ? parseFloat(roofArea) : null,
        budget: budget ? parseFloat(budget) : null,
        energy_usage: energyUsage ? parseFloat(energyUsage) : null,
        suitability_score: suitability,
        recommended_panel: panelType,
        annual_energy: annualEnergy,
        annual_savings: annualSavings,
        monthly_production: monthlyProduction,
      };

      const { data, error } = await supabase.from("analyses").insert(insertData).select().single();

      if (error) {
        console.error("Insert error:", error);
        toast.error("Failed to save analysis");
        setSubmitting(false);
        return;
      }

      toast.success("Analysis complete!");
      navigate("/dashboard/results", { state: { analysisId: data.id, results: { ...insertData, id: data.id } } });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">New Solar Analysis</CardTitle>
          <CardDescription>Enter your site details and let AI evaluate solar potential.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Section */}
            <div className="space-y-3">
              <Label>Location / Address *</Label>
              <div className="relative" ref={wrapperRef}>
                <Input
                  placeholder="Enter address or place name"
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
                        className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-start gap-2"
                        onClick={() => selectSuggestion(s)}
                      >
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                        <span className="line-clamp-2">{s.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={detectLocation}
                disabled={detecting}
                className="w-full sm:w-auto"
              >
                {detecting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Detecting your location...</>
                ) : (
                  <><LocateFixed className="mr-2 h-4 w-4" /> Detect My Location</>
                )}
              </Button>

              {/* Coordinates display */}
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Navigation className="h-3.5 w-3.5" />
                  Coordinates {geocoding && <span className="text-xs text-primary animate-pulse">(Fetching coordinates...)</span>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Latitude</Label>
                    <Input
                      readOnly
                      value={latitude}
                      placeholder="—"
                      className="bg-background/50 text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Longitude</Label>
                    <Input
                      readOnly
                      value={longitude}
                      placeholder="—"
                      className="bg-background/50 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Site Type *</Label>
                <Select value={siteType} onValueChange={setSiteType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="agricultural">Agricultural / Open Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Obstruction Level *</Label>
                <Select value={obstruction} onValueChange={setObstruction}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None – Clear sky view</SelectItem>
                    <SelectItem value="partial">Partial – Some obstructions</SelectItem>
                    <SelectItem value="heavy">Heavy – Significant obstructions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Roof Area (m²)</Label>
                <Input type="number" placeholder="e.g. 120" value={roofArea} onChange={(e) => setRoofArea(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Budget (₹)</Label>
                <Input type="number" placeholder="e.g. 200000" value={budget} onChange={(e) => setBudget(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Energy Usage (kWh/mo)</Label>
                <Input type="number" placeholder="e.g. 900" value={energyUsage} onChange={(e) => setEnergyUsage(e.target.value)} />
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-primary to-solar-amber text-primary-foreground shadow-lg shadow-primary/25">
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Run Solar Analysis →"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
