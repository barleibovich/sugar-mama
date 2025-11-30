const guideVideo = new URL("../../video/guide.mp4", import.meta.url).href;
const explanationVideo = new URL("../../video/explanation.mp4", import.meta.url).href;

interface Props {
  onStart: () => void;
}

const Home: React.FC<Props> = ({ onStart }) => {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>בית</h2>
          <button className="cta-button" onClick={onStart} style={{ padding: "8px 12px" }}>
            מעבר למדידות שלי
          </button>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>
          סרטוני הסבר וידע רפואי שייעזרו לך להבין את סוכרת הריון ולייישם את ההנחיות.
        </p>

        <div style={{ marginTop: 12 }}>
          <h3 style={{ margin: "0 0 10px" }}>מהי סוכרת הריון ?</h3>
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 12, background: "#000" }}>
            <video
              src={explanationVideo}
              controls
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 12 }}
            />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <a
            href="https://www.maccabi4u.co.il/healthguide/medicalconditions/gestationaldiabetesmellitusgdm/"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#1d4ed8" }}
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
          חשוב: ההנחיות כאן כלליות בלבד. יש לפעול לפי ההוראות האישיות שקיבלת מהרופא/ה או הדיאטנית.
        </div>
      </div>
    </div>
  );
};

export default Home;
