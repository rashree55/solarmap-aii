import jsPDF from "jspdf";

interface AnalysisData {
  location_text: string;
  roof_area: number | null;
  monthly_bill: number | null;
  panel_type: string;
  num_panels: number;
  system_capacity_kw: number;
  annual_energy_kwh: number;
  annual_ghi_kwh: number;
  created_at?: string;
  installation_cost?: number;
  subsidy?: number;
  net_cost?: number;
  payback_years?: number;
  savings_25yr?: number;
  bill_coverage_pct?: number;
  co2_avoided_tonnes?: number;
  trees_equivalent?: number;
  suitability_rating?: string;
  suitability_score?: number;
  suitability_advice?: string;
}

const BRAND_ORANGE: [number, number, number] = [245, 130, 32];
const DARK_NAVY: [number, number, number]    = [17, 24, 39];
const GRAY: [number, number, number]         = [107, 114, 128];
const WHITE: [number, number, number]        = [255, 255, 255];
const LIGHT_BG: [number, number, number]     = [249, 250, 251];

export function generatePDF(analysis: AnalysisData) {
  const doc   = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  let y = 0;

  // Header
  doc.setFillColor(...DARK_NAVY);
  doc.rect(0, 0, pageW, 38, "F");
  doc.setFontSize(22);
  doc.setTextColor(...WHITE);
  doc.text("SolarMap AI", 20, 18);
  doc.setFontSize(11);
  doc.setTextColor(200, 200, 200);
  doc.text("Solar Analysis Report", 20, 28);
  const dateStr = analysis.created_at
    ? new Date(analysis.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  doc.setFontSize(9);
  doc.text(`Generated: ${dateStr}`, pageW - 20, 28, { align: "right" });
  doc.setFillColor(...BRAND_ORANGE);
  doc.rect(0, 38, pageW, 2, "F");
  y = 52;

  // Section 1: Location
  y = sectionHeading(doc, "1. Location Information", y);
  y = infoRow(doc, "Address / Coordinates", analysis.location_text, y);
  y = infoRow(doc, "Roof Area",    analysis.roof_area    ? `${analysis.roof_area} m²`                        : "N/A", y);
  y = infoRow(doc, "Monthly Bill", analysis.monthly_bill ? `Rs. ${analysis.monthly_bill.toLocaleString()}`   : "N/A", y);
  if (analysis.suitability_rating) {
    y = infoRow(doc, "Suitability", `${analysis.suitability_rating} (${analysis.suitability_score}/9)`, y);
  }
  y += 8;

  // Section 2: Performance Summary
  y = sectionHeading(doc, "2. Performance Summary", y);
  const metrics = [
    { label: "Recommended Panel", value: analysis.panel_type },
    { label: "Number of Panels",  value: `${analysis.num_panels} panels` },
    { label: "Annual Energy",     value: `${Math.round(analysis.annual_energy_kwh).toLocaleString()} kWh` },
    { label: "System Capacity",   value: `${Number(analysis.system_capacity_kw).toFixed(2)} kW` },
  ];
  const cardW = (pageW - 50) / 2;
  metrics.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx  = 20 + col * (cardW + 10);
    const cy  = y + row * 26;
    doc.setFillColor(...LIGHT_BG);
    doc.roundedRect(cx, cy, cardW, 22, 3, 3, "F");
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(m.label, cx + 6, cy + 8);
    doc.setFontSize(13);
    doc.setTextColor(...DARK_NAVY);
    doc.text(m.value, cx + 6, cy + 18);
  });
  y += 62;

  // Section 3: Financial Summary
  if (analysis.installation_cost != null) {
    if (y > 220) { doc.addPage(); y = 20; }
    y = sectionHeading(doc, "3. Financial Summary", y);
    y = infoRow(doc, "Installation Cost",      `Rs. ${Math.round(analysis.installation_cost).toLocaleString()}`, y);
    y = infoRow(doc, "PM Surya Ghar Subsidy",  `Rs. ${Math.round(analysis.subsidy ?? 0).toLocaleString()}`,      y);
    y = infoRow(doc, "Net Cost After Subsidy", `Rs. ${Math.round(analysis.net_cost ?? 0).toLocaleString()}`,     y);
    y = infoRow(doc, "Payback Period",         `${analysis.payback_years} years`,                                y);
    y = infoRow(doc, "25-Year Net Savings",    `Rs. ${Math.round(analysis.savings_25yr ?? 0).toLocaleString()}`, y);
    y = infoRow(doc, "Bill Coverage",          `${Number(analysis.bill_coverage_pct ?? 0).toFixed(1)}%`,         y);
    y += 8;
  }

  // Section 4: Environmental Impact
  if (analysis.co2_avoided_tonnes != null) {
    if (y > 220) { doc.addPage(); y = 20; }
    y = sectionHeading(doc, "4. Environmental Impact (25-year lifetime)", y);
    y = infoRow(doc, "CO2 Avoided",      `${Number(analysis.co2_avoided_tonnes).toFixed(1)} tonnes`, y);
    y = infoRow(doc, "Equivalent Trees", `${Math.round(analysis.trees_equivalent ?? 0).toLocaleString()} trees`, y);
    y = infoRow(doc, "Annual GHI",       `${Math.round(analysis.annual_ghi_kwh).toLocaleString()} kWh/m2`, y);
    y += 8;
  }

  // Section 5: Recommendation
  if (y > 220) { doc.addPage(); y = 20; }
  y = sectionHeading(doc, "5. Recommendation", y);
  doc.setFontSize(10);
  doc.setTextColor(...DARK_NAVY);
  const recText = `We recommend installing ${analysis.num_panels} ${analysis.panel_type} panels with a total capacity of ${Number(analysis.system_capacity_kw).toFixed(2)} kW. This system will generate approximately ${Math.round(analysis.annual_energy_kwh).toLocaleString()} kWh annually${analysis.net_cost ? `, with a net cost of Rs. ${Math.round(analysis.net_cost).toLocaleString()} after subsidy and a payback period of ${analysis.payback_years} years` : ""}. Over 25 years, this system will avoid ${Number(analysis.co2_avoided_tonnes ?? 0).toFixed(1)} tonnes of CO2 emissions.`;
  const lines = doc.splitTextToSize(recText, pageW - 40);
  doc.text(lines, 20, y);
  y += lines.length * 5 + 10;

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setDrawColor(220, 220, 220);
  doc.line(20, footerY - 4, pageW - 20, footerY - 4);
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("Generated by SolarMap AI · Version 1.0", 20, footerY);
  doc.text("© SolarMap AI", pageW - 20, footerY, { align: "right" });

  doc.save("SolarMap-AI-Report.pdf");
}

function sectionHeading(doc: jsPDF, text: string, y: number): number {
  doc.setFontSize(13);
  doc.setTextColor(...BRAND_ORANGE);
  doc.text(text, 20, y);
  y += 3;
  doc.setDrawColor(...BRAND_ORANGE);
  doc.setLineWidth(0.5);
  doc.line(20, y, 80, y);
  return y + 8;
}

function infoRow(doc: jsPDF, label: string, value: string, y: number): number {
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(label, 20, y);
  doc.setFontSize(10);
  doc.setTextColor(...DARK_NAVY);
  doc.text(value, 100, y);
  return y + 7;
}
