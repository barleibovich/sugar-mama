interface Props {
  onStart: () => void;
}

const HowTo: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>איך למדוד</h2>
        <button className="cta-button" onClick={onStart} style={{ padding: "8px 12px" }}>
          מעבר למדידות שלי
        </button>
      </div>
      <p className="muted">הנחיות יומיות ומקצועיות למדידה נכונה ולשמירת המידע באפליקציה.</p>

      <Section
        title={`סדר המדידות היומי (סה"כ 4 מדידות)`}
        bullets={[
          "1. סוכר בצום: בבוקר מיד כשמתעוררים, לפני אוכל/שתיה/צחצוח שיניים, אחרי לפחות 8 שעות צום (רק מים).",
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
          "הכניסי מחט חדשה ומדי סטריפ חדש לפי הוראות החוברת/ה.",
        ]}
      />

      <Section
        title="איך מבצעים את המדידה"
        bullets={[
          "הכניסי סטריפ חדש — המכשיר ידלוק אוטומטית.",
          "כוני את עומק הדקירה בעת, ודקרי בצד האצבע.",
          "סחטי בעדינות עד שטיפת דם בולטת והקריבי את הסטריפ לטיפת הדם.",
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
  );
};

export default HowTo;

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
