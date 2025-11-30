import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useMeasurements } from "../context/MeasurementProvider";
import { getStatus } from "../ranges";
import { MeasurementCategory, MeasurementStatus } from "../types";
import { runOcrOnImage } from "../utils/ocr";

interface Props {
  category: MeasurementCategory;
  onClose: () => void;
  defaultTimestamp?: string;
  lockCategory?: boolean;
}

const AddMeasurementModal: React.FC<Props> = ({ category, onClose, defaultTimestamp, lockCategory }) => {
  const { categories, addMeasurement, rangeConfig } = useMeasurements();
  const [value, setValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MeasurementCategory>(category);
  const [timestamp, setTimestamp] = useState(() =>
    defaultTimestamp ? makeLocalInputValue(new Date(defaultTimestamp)) : makeLocalInputValue(new Date())
  );
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrHint, setOcrHint] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsedValue = useMemo(() => Number.parseInt(value, 10), [value]);

  const statusPreview: MeasurementStatus | null = useMemo(() => {
    if (Number.isNaN(parsedValue)) return null;
    return getStatus(parsedValue, selectedCategory, rangeConfig);
  }, [parsedValue, selectedCategory, rangeConfig]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const input = document.getElementById("glucose-input");
      input?.focus();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const save = () => {
    if (Number.isNaN(parsedValue)) return;
    const dateIso = new Date(timestamp).toISOString();
    addMeasurement(parsedValue, selectedCategory, dateIso);
    onClose();
  };

  const triggerOcrPicker = () => {
    setOcrError(null);
    setOcrHint(null);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setOcrError(null);
    setOcrHint(null);
    setOcrProgress(0);
    setOcrLoading(true);
    try {
      const { value: detected, rawText } = await runOcrOnImage(file, (progress) => setOcrProgress(Math.round(progress * 100)));
      if (detected !== undefined && !Number.isNaN(detected)) {
        setValue(detected.toString());
        setOcrHint(`הערך שזוהה: ${detected}`);
      } else {
        setOcrError("לא הצלחתי לזהות מספר ברור. נסי תמונה חדה יותר.");
      }
      if (rawText.trim()) {
        setOcrHint((prev) => prev ?? `טקסט מזוהה: ${rawText.trim()}`);
      }
    } catch (err) {
      setOcrError("אירעה שגיאה בזמן הזיהוי. נסי שוב.");
    } finally {
      setOcrLoading(false);
      setOcrProgress(0);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>הוספת מדידה</h3>
          <button onClick={onClose} className="cta-button secondary" style={{ padding: "6px 10px" }}>
            סגירה
          </button>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label>קטגוריה</label>
          {lockCategory ? (
            <input value={selectedCategory} disabled />
          ) : (
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as MeasurementCategory)}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
          <span className="muted" style={{ fontSize: 13 }}>
            {lockCategory
              ? "הקטגוריה ננעלת לפי התא שבחרת."
              : "בחרי את הקטגוריה המתאימה. ניתן להוסיף מדידות לכמה קטגוריות ביום."}
          </span>
        </div>

        <div className="field">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <label htmlFor="glucose-input">ערך הגלוקוז (mg/dL)</label>
            <button type="button" className="cta-button secondary" onClick={triggerOcrPicker} disabled={ocrLoading}>
              {ocrLoading ? "סורקת..." : "סריקת ערך מתמונה"}
            </button>
          </div>
          <input
            id="glucose-input"
            inputMode="numeric"
            placeholder="לדוגמה 104"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handleFileSelected}
          />
          {ocrLoading && (
            <div className="muted" style={{ marginTop: 6 }}>
              סורקת את התמונה... {ocrProgress ? `${ocrProgress}%` : ""}
            </div>
          )}
          {ocrHint && <div style={{ marginTop: 6, color: "#0f172a" }}>{ocrHint}</div>}
          {ocrError && <div style={{ marginTop: 6, color: "#b91c1c" }}>{ocrError}</div>}
        </div>

        <div className="field">
          <label>זמן מדידה</label>
          <input type="datetime-local" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} />
        </div>

        <div className="field">
          <label>סטטוס</label>
          {statusPreview ? (
            <StatusBadge status={statusPreview} />
          ) : (
            <span className="muted">הזיני ערך כדי לראות אם הוא בטווח, מעל או מתחת.</span>
          )}
          <span className="muted" style={{ fontSize: 13 }}>
            החיווי מותאם לפי הטווחים שהגדרת בהגדרות.
          </span>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "flex-end" }}>
          <button className="cta-button secondary" onClick={onClose}>
            ביטול
          </button>
          <button className="cta-button" onClick={save} disabled={Number.isNaN(parsedValue)}>
            שמירה
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMeasurementModal;

const StatusBadge: React.FC<{ status: MeasurementStatus }> = ({ status }) => {
  const copy = status === "inRange" ? "בטווח" : status === "aboveRange" ? "מעל הטווח" : "מתחת לטווח";
  const className =
    status === "inRange" ? "status in-range" : status === "aboveRange" ? "status above-range" : "status below-range";
  return <div className={className}>{copy}</div>;
};

function makeLocalInputValue(date: Date) {
  const tzOffset = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - tzOffset);
  return local.toISOString().slice(0, 16);
}
