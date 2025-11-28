const guideVideo = new URL("../../video/guide.mp4", import.meta.url).href;
const explanationVideo = new URL("../../video/explanation.mp4", import.meta.url).href;

interface Props {
  onStart: () => void;
}

const Home: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="grid-two">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <h2 style={{ margin: 0 }}>איך למדוד</h2>
          <button className="cta-button" onClick={onStart} style={{ padding: "8px 12px" }}>
            מעבר למדידות שלי
          </button>
        </div>
        <p className="muted">הנחיות יומיומיות למדידה נכונה ולשמירת המידע באפליקציה.</p>

        <Section
          title={`סדר המדידות היומי (סה"כ 4 מדידות)`}
          bullets={[
            "1. סוכר בצום: בבוקר מיד כשמתעוררים, לפני אוכל/שתייה/צחצוח שיניים, אחרי לפחות 8 שעות צום (רק מים).",
            "2. שעתיים אחרי ארוחת בוקר: למדוד שעתיים מהביס הראשון.",
            "3. שעתיים אחרי ארוחת צהריים: למדוד שעתיים מהביס הראשון.",
            "4. שעתיים אחרי ארוחת ערב: למדוד שעתיים מהביס הראשון.",
          ]}
        />

        <Section
          title="טווחים מומלצים (כללי, לדוגמה)"
          bullets={[
            "צום: תקין עד 95 mg/dL, מעל 95 = גבוה.",
            "אחרי ארוחות: תקין עד 120 mg/dL, מעל 120 = גבוה.",
            "הטווחים וההנחיות כאן הם כלליים בלבד; המעקב האמיתי נקבע על ידי הרופא/ה או הדיאטנית.",
          ]}
        />

        <Section
          title="איך מתכוננים למדידה"
          bullets={[
            "רחצי ידיים במים וסבון כדי למנוע שאריות אוכל שיגרמו לערך גבוה שגוי, ואז ייבשי היטב.",
            "הכיני מראש: מכשיר, עט הדוקר, מחט חדשה, סטריפ חדש.",
          ]}
        />

        <Section
          title="איך מבצעים את המדידה"
          bullets={[
            "הכניסי סטריפ חדש — המכשיר יידלק אוטומטית.",
            "כווני את עומק הדקירה בעט, ודקרי בצד האצבע.",
            "סחטי בעדינות עד שטיפת דם בינונית תופיע והקריבי את הסטריפ לטיפת הדם.",
            "המתיני לערך המוצג והזיני מיד באפליקציה כדי לא לאבד מידע.",
          ]}
        />

        <Section
          title="אחרי המדידה"
          bullets={[
            "זרקי את הסטריפ המשומש.",
            "החליפי מחט פעם ביום (או לפי נוחות).",
          ]}
        />
      </div>

      <div className="card">
        <h3 style={{ margin: "0 0 10px" }}>מהי סוכרת הריון ?</h3>
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 12, background: "#000" }}>
          <video
            src={explanationVideo}
            controls
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 12 }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <a
            href="https://www.maccabi4u.co.il/healthguide/medicalconditions/gestationaldiabetesmellitusgdm/"
            target="_blank"
            rel="noreferrer"
            style={{color: "#1d4ed8"}}
          >
            <strong>סוכרת הריון מידע רפואי</strong>
          </a>
        </div>
        <div style={{ marginTop: 16 }}>
          <h3 style={{ margin: "0 0 10px" }}>איך מודדים סוכר ?</h3>
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 12, background: "#000" }}>
            <video
              src={guideVideo}
              controls
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 12 }}
            />
          </div>
        </div>
        <div className="footer-note" style={{ marginTop: 10 }}>
          חשוב: ההנחיות הינן כלליות בלבד. יש לפעול לפי ההוראות האישיות שקיבלת מהרופא/ה או הדיאטנית.
        </div>
      </div>
    </div>
  );
};

export default Home;

const Section: React.FC<{ title: string; bullets: string[] }> = ({ title, bullets }) => (
  <div style={{ marginTop: 12 }}>
    <h4 style={{ margin: "6px 0" }}>{title}</h4>
    <ul style={{ paddingLeft: 18, margin: 0 }}>
      {bullets.map((item) => (
        <li key={item} style={{ marginBottom: 6 }}>
          {item}
        </li>
      ))}
    </ul>
  </div>
);
