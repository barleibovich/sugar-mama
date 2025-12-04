import { FormEvent, useMemo, useState } from "react";
import Home from "./components/Home";
import HowTo from "./components/HowTo";
import Measurements from "./components/Measurements";
import { useAuth } from "./context/AuthProvider";
import { useMeasurements } from "./context/MeasurementProvider";

type View = "home" | "measurements" | "howTo";

const App = () => {
  const [view, setView] = useState<View>("home");
  const { measurements } = useMeasurements();
  const { user, loading: authLoading, signOut } = useAuth();

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

  if (authLoading) {
    return (
      <div className="app-shell">
        <div className="card">
          <h3 style={{ margin: 0 }}>טוען...</h3>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-shell">
        <AuthScreen />
      </div>
    );
  }

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
          <button className="cta-button secondary" onClick={() => signOut()}>
            יציאה
          </button>
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

const AuthScreen = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const { signIn, signUp, error, clearError } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setInfo(null);
    clearError();

    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        setInfo("נשלח מייל לאישור. לאחר אישור התחברות תועברו לאפליקציה.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 520, margin: "32px auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 24 }}>👩‍⚕️</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>SugarMama</div>
          <div className="muted" style={{ fontSize: 14 }}>מעקב סוכרת הריונית</div>
        </div>
      </div>
      <h2 style={{ margin: "0 0 6px" }}>{mode === "login" ? "כניסה" : "הרשמה"}</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        התחברות נדרשת כדי לשמור את המדידות בחשבון האישי.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>אימייל</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>סיסמה</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <div style={{ color: "#b91c1c" }}>{error}</div>}
        {info && <div style={{ color: "#166534" }}>{info}</div>}
        <button type="submit" className="cta-button" disabled={submitting}>
          {submitting ? "מבצע..." : mode === "login" ? "כניסה" : "הרשמה"}
        </button>
      </form>

      <div style={{ marginTop: 10 }}>
        {mode === "login" ? (
          <button className="cta-button secondary" onClick={() => setMode("signup")} disabled={submitting}>
            אין חשבון? הרשמה
          </button>
        ) : (
          <button className="cta-button secondary" onClick={() => setMode("login")} disabled={submitting}>
            יש חשבון? כניסה
          </button>
        )}
      </div>
    </div>
  );
};
