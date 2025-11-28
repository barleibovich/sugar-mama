import { useEffect, useMemo, useState } from "react";
import { useMeasurements } from "../context/MeasurementProvider";
import { getStatus } from "../ranges";
import { MeasurementCategory, MeasurementStatus } from "../types";

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
              ? "הקטגוריה ננעלה לפי העמודה שבחרת."
              : "בחרי קטגוריה מתאימה. אפשר לשנות גם אחרי בחירה בעמודה כדי לתקן."}
          </span>
        </div>

        <div className="field">
          <label htmlFor="glucose-input">ערך גלוקוז (mg/dL)</label>
          <input
            id="glucose-input"
            inputMode="numeric"
            placeholder="לדוגמה 104"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <div className="field">
          <label>תאריך ושעה</label>
          <input type="datetime-local" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} />
        </div>

        <div className="field">
          <label>סטטוס</label>
          {statusPreview ? (
            <StatusBadge status={statusPreview} />
          ) : (
            <span className="muted">הקלידי ערך כדי לראות אם הוא בטווח, מעל או מתחת.</span>
          )}
          <span className="muted" style={{ fontSize: 13 }}>
            הטווחים נקבעים לפי ההגדרות האישיות או ברירת המחדל.
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
