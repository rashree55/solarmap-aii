import jsPDF from "jspdf";

interface AnalysisData {
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
  created_at?: string;
}

const BRAND_ORANGE: [number, number, number] = [245, 130, 32];
const DARK_NAVY: [number, number, number] = [17, 24, 39];
const GRAY: [number, number, number] = [107, 114, 128];
const WHITE: [number, number, number] = [255, 255, 255];
const LIGHT_BG: [number, number, number] = [249, 250, 251];

export function generatePDF(analysis: AnalysisData) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  let y = 0;

  // ── Header bar ──
  doc.setFillColor(...DARK_NAVY);
  doc.rect(0, 0, pageW, 38, "F");
  doc.setFontSize(22);
  doc.setTextColor(...WHITE);
  doc.text("SolarMap AI", 20, 18);
  doc.setFontSize(11);
  doc.setTextColor(200, 200, 200);
  doc.text("Solar Analysis Report", 20, 28);
  const dateStr = analysis.created_at
    ? new Date(analysis.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  doc.setFontSize(9);
  doc.text(`Generated: ${dateStr}`, pageW - 20, 28, { align: "right" });

  // ── Orange accent line ──
  doc.setFillColor(...BRAND_ORANGE);
  doc.rect(0, 38, pageW, 2, "F");

  y = 52;

  // ── Section 1: Location Information ──
  y = sectionHeading(doc, "1. Location Information", y);
  y = infoRow(doc, "Address / Coordinates", analysis.location_text, y);
  y = infoRow(doc, "Site Type", capitalize(analysis.site_type), y);
  y = infoRow(doc, "Obstruction Level", capitalize(analysis.obstruction_level), y);
  y += 8;

  // ── Section 2: Performance Summary ──
  y = sectionHeading(doc, "2. Performance Summary", y);
  const metrics = [
    { label: "Suitability Score", value: `${analysis.suitability_score}%` },
    { label: "Recommended Panel", value: analysis.recommended_panel },
    { label: "Annual Energy Production", value: `${analysis.annual_energy.toLocaleString()} kWh` },
    { label: "Estimated Annual Savings", value: `$${analysis.annual_savings.toLocaleString()}` },
  ];
  const cardW = (pageW - 50) / 2;
  metrics.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 20 + col * (cardW + 10);
    const cy = y + row * 26;
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

  // ── Section 3: Monthly Production Table ──
  y = sectionHeading(doc, "3. Monthly Energy Production", y);
  const months = analysis.monthly_production ?? [];
  // Table header
  doc.setFillColor(...DARK_NAVY);
  doc.rect(20, y, pageW - 40, 8, "F");
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.text("Month", 26, y + 6);
  doc.text("Energy (kWh)", pageW - 26, y + 6, { align: "right" });
  y += 8;
  months.forEach((m, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(245, 247, 250);
      doc.rect(20, y, pageW - 40, 7, "F");
    }
    doc.setFontSize(9);
    doc.setTextColor(...DARK_NAVY);
    doc.text(m.month, 26, y + 5);
    doc.text(m.kWh.toLocaleString(), pageW - 26, y + 5, { align: "right" });
    y += 7;
  });
  y += 8;

  // ── Section 4: System Inputs ──
  if (y > 240) { doc.addPage(); y = 20; }
  y = sectionHeading(doc, "4. System Inputs", y);
  y = infoRow(doc, "Roof Area", analysis.roof_area ? `${analysis.roof_area} m²` : "N/A", y);
  y = infoRow(doc, "Budget", analysis.budget ? `$${analysis.budget.toLocaleString()}` : "N/A", y);
  y = infoRow(doc, "Monthly Energy Usage", analysis.energy_usage ? `${analysis.energy_usage} kWh` : "N/A", y);
  y += 8;

  // ── Section 5: Recommendation ──
  y = sectionHeading(doc, "5. Recommendation", y);
  doc.setFontSize(10);
  doc.setTextColor(...DARK_NAVY);
  const recText = `Based on a suitability score of ${analysis.suitability_score}%, we recommend installing ${analysis.recommended_panel} panels. This configuration is projected to generate approximately ${analysis.annual_energy.toLocaleString()} kWh of clean energy annually, resulting in estimated savings of $${analysis.annual_savings.toLocaleString()} per year. The ${analysis.obstruction_level} obstruction level at your ${analysis.site_type} site supports this recommendation.`;
  const lines = doc.splitTextToSize(recText, pageW - 40);
  doc.text(lines, 20, y);
  y += lines.length * 5 + 10;

  // ── Footer ──
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
  doc.text(value, 75, y);
  return y + 7;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
