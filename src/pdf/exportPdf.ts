import jsPDF from "jspdf";
import "./HebrewFont-normal.js";
import { measurementCategories } from "../constants";
import { getStatus } from "../ranges";
import { GlucoseMeasurement, MeasurementCategory, RangeConfiguration } from "../types";

const categoryOrder: MeasurementCategory[] = measurementCategories;

export interface ExportRange {
  start?: Date;
  end?: Date;
}

export async function exportPdf(
  measurements: GlucoseMeasurement[],
  rangeConfig: RangeConfiguration,
  range?: ExportRange
): Promise<string | URL> {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  doc.setFont("HebrewFont", "normal");
  doc.setR2L(true);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 32;
  const colWidth = 110;
  const startX = pageWidth - margin;

  const filtered = measurements.filter((m) => {
    const t = new Date(m.timestamp).getTime();
    if (range?.start && t < range.start.getTime()) return false;
    if (range?.end && t > range.end.getTime()) return false;
    return true;
  });
  const sorted = [...filtered].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  doc.setFontSize(16);
  doc.text("דוח מעקב גלוקוז", startX, 32, { align: "right" });
  doc.setFontSize(10);
  doc.text("טווחי ברירת מחדל: צום עד 95, אחרי ארוחות עד 120 (mg/dL).", startX, 44, { align: "right" });
  doc.text("הטווחים כאן כלליים בלבד. פעלי לפי ההמלצות האישיות מהרופא/ה או הדיאטנית.", startX, 56, { align: "right" });
  doc.text("הדוח הוא למעקב בלבד ואינו מחליף ייעוץ רפואי.", startX, 68, { align: "right" });

  let y = 90;
  doc.setFontSize(11);
  doc.setTextColor("#0f172a");

  const headers: (string | MeasurementCategory)[] = ["תאריך", ...categoryOrder];
  headers.forEach((text, idx) => {
    const x = startX - idx * colWidth;
    doc.text(text, x, y, { align: "right" });
  });
  y += 16;

  if (!sorted.length) {
    doc.text("אין מדידות להצגה בטווח שנבחר.", startX, y + 4, { align: "right" });
    return doc.output("bloburl");
  }

  const rows = buildGrid(sorted);
  doc.setFontSize(10);
  rows.forEach((row) => {
    if (y > 760) {
      doc.addPage();
      y = 40;
    }
    doc.text(row.displayDate, startX, y, { align: "right" });
    categoryOrder.forEach((cat, idx) => {
      const x = startX - (idx + 1) * colWidth;
      const values = row.cells[cat] ?? [];
      if (!values.length) return;
      const lines = values.map((m) => {
        const time = new Date(m.timestamp).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
        const status = getStatus(m.value, m.category, rangeConfig);
        const statusText = status === "inRange" ? "בטווח" : status === "aboveRange" ? "מעל" : "מתחת";
        return `${m.value} ${m.unit} · ${time} · ${statusText}`;
      });
      doc.text(lines.join("\n"), x, y, { align: "right" });
    });
    y += 18;
  });

  return doc.output("bloburl");
}

export { categoryOrder };

function buildGrid(measurements: GlucoseMeasurement[]) {
  const map = new Map<string, { date: Date; cells: Record<MeasurementCategory, GlucoseMeasurement[]> }>();
  measurements.forEach((m) => {
    const day = new Date(m.timestamp);
    day.setHours(0, 0, 0, 0);
    const key = day.toISOString();
    if (!map.has(key)) {
      map.set(key, { date: day, cells: {} as Record<MeasurementCategory, GlucoseMeasurement[]> });
    }
    const entry = map.get(key)!;
    const bucket = entry.cells[m.category] ?? [];
    bucket.push(m);
    entry.cells[m.category] = bucket;
  });

  return Array.from(map.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((row) => ({
      displayDate: row.date.toLocaleDateString("he-IL", { dateStyle: "medium" }),
      cells: row.cells,
    }));
}
