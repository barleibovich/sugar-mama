import { useMemo, useState } from "react";
import AddMeasurementModal from "./AddMeasurementModal";
import { useMeasurements } from "../context/MeasurementProvider";
import { exportPdf, ExportRange } from "../pdf/exportPdf";
import { GlucoseMeasurement, MeasurementCategory } from "../types";

interface Props {
  onBack: () => void;
}

type PdfRangeOption = "week" | "month" | "threeMonths" | "all";

const Measurements: React.FC<Props> = ({ onBack }) => {
  const { measurements, categories, deleteMeasurement, rangeConfig, loading } = useMeasurements();
  const [exporting, setExporting] = useState(false);
  const [addContext, setAddContext] = useState<{ category: MeasurementCategory; date?: Date; lockCategory?: boolean } | null>(
    null
  );
  const [weekOffset, setWeekOffset] = useState(0);
  const [pdfRange, setPdfRange] = useState<PdfRangeOption>("month");
  const [showExportOptions, setShowExportOptions] = useState(false);

  const currentWeek = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(addDays(now, weekOffset * 7));
    const end = addDays(start, 6);
    return { start, end };
  }, [weekOffset]);

  const tableRows = useMemo(() => {
    const filtered = filterByRange(measurements, currentWeek.start, currentWeek.end);
    return buildGrid(filtered, categories, currentWeek.start, currentWeek.end);
  }, [measurements, categories, currentWeek]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const range = exportRangeFromSelection(pdfRange);
      const url = await exportPdf(measurements, rangeConfig, range);
      const link = document.createElement("a");
      link.href = url.toString();
      link.download = "SugarMama-דוח-גלוקוז.pdf";
      link.click();
      setShowExportOptions(false);
    } finally {
      setExporting(false);
    }
  };

  const confirmAndDelete = (id: string) => {
    const ok = window.confirm("האם למחוק את המדידה?");
    if (ok) deleteMeasurement(id);
  };

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>המדידות שלי</h2>
          <p className="muted" style={{ margin: "4px 0 0" }}>
            מציג את המדידות לפי שבוע נבחר (ראשון–שבת). אפשר להוסיף מדידה על ידי לחיצה על תא ריק בקטגוריה הרלוונטית.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button
            className="cta-button"
            onClick={() => setAddContext({ category: categories[0], date: new Date(), lockCategory: false })}
            disabled={isFutureDate(new Date())}
          >
            הוספת מדידה
          </button>
          <div style={{ position: "relative" }}>
            <button
              className="cta-button secondary"
              onClick={() => setShowExportOptions((prev) => !prev)}
              disabled={!measurements.length}
            >
              {exporting ? "מייצא PDF..." : "ייצוא PDF"}
            </button>
            {showExportOptions && (
              <div
                className="card"
                style={{
                  position: "absolute",
                  top: "110%",
                  right: 0,
                  zIndex: 5,
                  width: 260,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ display: "grid", gap: 8 }}>
                  <label className="muted" style={{ fontSize: 14 }}>
                    טווח ל-PDF:
                  </label>
                  <select
                    value={pdfRange}
                    onChange={(e) => setPdfRange(e.target.value as PdfRangeOption)}
                    style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }}
                  >
                    <option value="week">שבוע אחרון</option>
                    <option value="month">חודש אחרון (ברירת מחדל)</option>
                    <option value="threeMonths">3 חודשים אחרונים</option>
                    <option value="all">כל המדידות</option>
                  </select>
                  <button className="cta-button" onClick={handleExport} disabled={exporting}>
                    הורדת PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <button className="cta-button secondary" onClick={() => setWeekOffset((prev) => prev - 1)}>
          → שבוע קודם
        </button>
        <div className="badge">
          {currentWeek.start.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" })} עד{" "}
          {currentWeek.end.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" })}
        </div>
        <button
          className="cta-button secondary"
          onClick={() => setWeekOffset((prev) => Math.min(prev + 1, 0))}
          disabled={weekOffset === 0}
        >
          שבוע הבא ←
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ background: "#f8fafc", borderStyle: "dashed", borderColor: "#cbd5e1", marginTop: 12 }}>
          <h4 style={{ margin: "4px 0" }}>טוען מדידות...</h4>
        </div>
      ) : tableRows.length === 0 ? (
        <div className="card" style={{ background: "#f8fafc", borderStyle: "dashed", borderColor: "#cbd5e1", marginTop: 12 }}>
          <h4 style={{ margin: "4px 0" }}>אין מדידות להצגה בטווח הנוכחי.</h4>
          <p className="muted" style={{ margin: 0 }}>הוסיפי מדידה חדשה כדי להתחיל למלא את הטבלה.</p>
        </div>
      ) : (
        <div style={{ marginTop: 12 }} className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>תאריך</th>
                {categories.map((cat) => (
                  <th key={cat}>{cat}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={row.key}>
                  <th scope="row">
                    <div>
                      <div style={{ fontWeight: 700 }}>{row.displayDate}</div>
                      <div className="muted" style={{ fontSize: 8 }}>
                        {row.weekday}
                      </div>
                    </div>
                  </th>
                  {categories.map((cat) => (
                    <td
                      key={`${row.key}-${cat}`}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.tagName.toLowerCase() === "button") return;
                        if (isFutureDate(row.date)) return;
                        setAddContext({ category: cat, date: row.date, lockCategory: true });
                      }}
                      style={{ cursor: isFutureDate(row.date) ? "not-allowed" : "pointer" }}
                    >
                      <Cell
                        measurements={row.cells[cat] ?? []}
                        onAdd={() => {
                          if (isFutureDate(row.date)) return;
                          setAddContext({ category: cat, date: row.date, lockCategory: true });
                        }}
                        onDelete={(id) => confirmAndDelete(id)}
                        disableAdd={isFutureDate(row.date)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {addContext && (
        <AddMeasurementModal
          category={addContext.category}
          defaultTimestamp={mergeDateWithCurrentTime(addContext.date ?? new Date()).toISOString()}
          lockCategory={addContext.lockCategory}
          onClose={() => setAddContext(null)}
        />
      )}
    </div>
  );
};

export default Measurements;

const Cell: React.FC<{
  measurements: GlucoseMeasurement[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  disableAdd?: boolean;
}> = ({ measurements, onAdd, onDelete, disableAdd }) => {
  if (!measurements.length) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span className="cell-empty">אין מדידות</span>
        <button className="cta-button secondary" onClick={onAdd} style={{ padding: "8px 10px" }} disabled={disableAdd}>
          הוספת ערך
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 6 }}>
      {measurements.map((m) => {
        const className =
          m.status === "inRange"
            ? "cell-badge in-range"
            : m.status === "aboveRange"
              ? "cell-badge above-range"
              : "cell-badge below-range";
        const label = m.status === "inRange" ? "בטווח" : m.status === "aboveRange" ? "מעל הטווח" : "מתחת לטווח";
        return (
          <div key={m.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div>
              <div className="measurement-value">{`${m.value} ${m.unit}`}</div>
              <div className="muted" style={{ fontSize: 8 }}>
                {new Date(m.timestamp).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <div className={className}>{label}</div>
            <button
              className="cta-button secondary"
              onClick={() => onDelete(m.id)}
              style={{ padding: "3px 5px", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 3, fontSize: 9 }}
            >
              מחיקה
              <span style={{ fontSize: 9 }}>🗑️</span>
            </button>
          </div>
        );
      })}
      <button className="cta-button secondary" onClick={onAdd} style={{ padding: "8px 10px" }} disabled={disableAdd}>
        הוספת ערך
      </button>
    </div>
  );
};

function buildGrid(
  measurements: GlucoseMeasurement[],
  categories: MeasurementCategory[],
  weekStart: Date,
  weekEnd: Date
) {
  const days: { date: Date; cells: Record<MeasurementCategory, GlucoseMeasurement[]> }[] = [];
  const dayCount = Math.round((weekEnd.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  for (let i = 0; i < dayCount; i++) {
    const d = addDays(weekStart, i);
    days.push({ date: d, cells: {} as Record<MeasurementCategory, GlucoseMeasurement[]> });
  }

  measurements.forEach((m) => {
    const day = new Date(m.timestamp);
    day.setHours(0, 0, 0, 0);
    const idx = Math.round((day.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    if (idx < 0 || idx >= days.length) return;
    const bucket = days[idx].cells[m.category] ?? [];
    bucket.push(m);
    days[idx].cells[m.category] = bucket.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  });

  return days
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((row) => ({
      key: row.date.toISOString(),
      date: row.date,
      displayDate: row.date.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "2-digit" }),
      weekday: row.date.toLocaleDateString("he-IL", { weekday: "long" }),
      cells: row.cells,
    }));
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // Sunday = 0
  const diff = day;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - diff);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function filterByRange(measurements: GlucoseMeasurement[], start: Date, end: Date) {
  return measurements.filter((m) => {
    const t = new Date(m.timestamp).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });
}

function exportRangeFromSelection(sel: PdfRangeOption): ExportRange | undefined {
  const end = new Date();
  if (sel === "week") return { start: addDays(end, -7), end };
  if (sel === "month") return { start: addDays(end, -30), end };
  if (sel === "threeMonths") return { start: addDays(end, -90), end };
  return undefined; // כל המדידות
}

function mergeDateWithCurrentTime(date: Date) {
  const now = new Date();
  const merged = new Date(date);
  merged.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  return merged;
}

function isFutureDate(date: Date) {
  const now = new Date();
  return date.getTime() > now.setHours(23, 59, 59, 999);
}
