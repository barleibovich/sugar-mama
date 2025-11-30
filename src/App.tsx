import { useMemo, useState } from "react";
import Home from "./components/Home";
import HowTo from "./components/HowTo";
import Measurements from "./components/Measurements";
import { useMeasurements } from "./context/MeasurementProvider";

type View = "home" | "measurements" | "howTo";

const App = () => {
  const [view, setView] = useState<View>("home");
  const { measurements } = useMeasurements();

  const totalCount = useMemo(() => measurements.length, [measurements]);

  const navButtons = useMemo(() => {
    if (view === "home") {
      return [
        { label: "מעבר למדידות שלי", target: "measurements" as View },
        { label: "איך למדוד", target: "howTo" as View },
      ];
    }

    if (view === "howTo") {
      return [
        { label: "מעבר למדידות שלי", target: "measurements" as View },
        { label: "בית", target: "home" as View },
      ];
    }

    return [
      { label: "בית", target: "home" as View },
      { label: "איך למדוד", target: "howTo" as View },
    ];
  }, [view]);

  return (
    <div className="app-shell">
      <header className="card hero">
        <div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 26 }}>👩‍⚕️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>SugarMama</div>
              <div className="muted" style={{ fontSize: 14 }}>
                מעקב סוכרת הריונית
              </div>
            </div>
          </div>
          <h1 style={{ margin: 0, fontSize: 26 }}>מחליפות את הדף המודפס ושומרות כל מדידה.</h1>
          <p className="muted" style={{ maxWidth: 640, margin: "6px 0 0" }}>
            רושמות את הסוכר לפי קטגוריה (צום, אחרי ארוחות, לפני שינה), רואות אם הערך בטווח, ומייצאות PDF לצוות המטפל.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {navButtons.map((btn) => (
            <button key={btn.target} className="cta-button" onClick={() => setView(btn.target)}>
              {btn.label}
            </button>
          ))}
          <div className="badge">{totalCount} נשמרו</div>
        </div>
      </header>

      <main style={{ marginTop: 18, display: "grid", gap: 14 }}>
        {view === "home" && <Home onStart={() => setView("measurements")} />}
        {view === "howTo" && <HowTo onStart={() => setView("measurements")} />}
        {view === "measurements" && <Measurements onBack={() => setView("home")} />}
      </main>
    </div>
  );
};

export default App;
