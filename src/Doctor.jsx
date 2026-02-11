import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5055";
const ding = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");

export default function Doctor({ logout }) {
  const [logged, setLogged] = useState(false);
  const [ward, setWard] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [queue, setQueue] = useState([]);
  const [nowServing, setNowServing] = useState(null);
  const [prevCheckedInCount, setPrevCheckedInCount] = useState(0);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message);
      setWard(data.ward);
      setDoctor(data.doctor);
      setLogged(true);
    } catch (e) { alert("Backend is waking up... please try again in a few seconds."); }
  };

  const load = async () => {
    if (!ward) return;
    try {
      const res = await fetch(`${API}/api/queue/${ward}`);
      const data = await res.json();
      setQueue(data.queue || []);
      setNowServing(data.nowServing || null);

      const currentCheckedIn = (data.queue || []).filter(p => p.checkedIn).length;
      if (currentCheckedIn > prevCheckedInCount) {
        ding.play().catch(() => console.log("Audio waiting for user interaction"));
      }
      setPrevCheckedInCount(currentCheckedIn);
    } catch (err) { console.error("Fetch error:", err); }
  };

  const callNext = async () => {
    try {
      await fetch(`${API}/api/call-next/${ward}`, { method: "POST" });
      load(); 
    } catch (e) { console.error("Connection error"); }
  };

  useEffect(() => {
    if (logged && ward) {
      load();
      const t = setInterval(load, 3000);
      return () => clearInterval(t);
    }
  }, [logged, ward]);

  const verifiedQueue = queue.filter(p => p.checkedIn);
  const isServingSomeone = nowServing !== null;
  const hasQueue = verifiedQueue.length > 0;

  if (!logged) {
    return (
      <div style={styles.loginPageDark}>
        <div style={styles.loginCardDark}>
          <h2 style={{marginBottom: '20px'}}>Doctor Portal</h2>
          <input style={styles.inputDark} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input style={styles.inputDark} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <button style={styles.loginBtn} onClick={login}>Login</button>
          <button style={styles.backBtn} onClick={logout}>Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.dashHeader}>
        <div style={styles.doctorInfo}>
          <div style={styles.docAvatar}>{doctor?.name?.charAt(0)}</div>
          <div><h2 style={styles.docName}>Dr. {doctor?.name}</h2><small>{ward}</small></div>
        </div>
        <button style={styles.logoutBtn} onClick={logout}>Logout</button>
      </header>

      <div style={styles.mainContent}>
        <div style={styles.servingCard}>
          <p style={styles.cardLabel}>CURRENT STATUS</p>
          <div style={styles.tokenDisplay}>{nowServing ? nowServing.token : "---"}</div>
          <p style={styles.patientMeta}>{nowServing ? nowServing.name : "Waiting for Patients"}</p>
          <button 
            style={{...styles.nextBtn, background: (!hasQueue && isServingSomeone) ? "#f59e0b" : "#10b981", opacity: (hasQueue || isServingSomeone) ? 1 : 0.5}} 
            onClick={callNext}
            disabled={!hasQueue && !isServingSomeone}
          >
            {!hasQueue && isServingSomeone ? "Finish & Clear Board ✓" : "Call Next Patient →"}
          </button>
        </div>

        <div style={styles.queueContainer}>
          <div style={styles.queueHeader}>
            <h3>Waiting Room</h3>
            <span style={styles.queueCount}>{verifiedQueue.length} Present</span>
          </div>
          {verifiedQueue.length === 0 ? <div style={styles.emptyState}>No patients currently waiting.</div> :
            verifiedQueue.map(p => (
              <div key={p.token} style={styles.queueItem}>
                <div style={styles.itemToken}>{p.token}</div>
                <div style={styles.itemName}>{p.name} {p.emergency && <span style={styles.emergencyTag}>EMG</span>}</div>
                <div style={styles.itemTime}>Verified</div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

const styles = {
  loginPageDark: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#0f172a" },
  loginCardDark: { background: "#1e293b", padding: "40px", borderRadius: "20px", color: "#fff", width: "320px", textAlign: "center" },
  inputDark: { width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "#fff" },
  loginBtn: { width: "100%", padding: "12px", borderRadius: "8px", background: "#3b82f6", color: "#fff", border: "none", fontWeight: "bold", cursor: "pointer" },
  backBtn: { background: "none", border: "none", color: "#64748b", marginTop: "15px", cursor: "pointer" },
  dashboardContainer: { padding: "20px", background: "#f8fafc", minHeight: "100vh" },
  dashHeader: { display: "flex", justifyContent: "space-between", background: "#fff", padding: "15px 25px", borderRadius: "15px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" },
  doctorInfo: { display: "flex", alignItems: "center", gap: "12px" },
  docAvatar: { width: "40px", height: "40px", background: "#3b82f6", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold" },
  docName: { margin: 0, fontSize: "16px" },
  logoutBtn: { color: "#ef4444", background: "none", border: "none", fontWeight: "bold", cursor: "pointer" },
  mainContent: { display: "grid", gridTemplateColumns: "350px 1fr", gap: "20px", marginTop: "20px" },
  servingCard: { background: "#1e293b", color: "#fff", padding: "40px 20px", borderRadius: "20px", textAlign: "center" },
  cardLabel: { fontSize: "11px", letterSpacing: "1px", color: "#94a3b8" },
  tokenDisplay: { fontSize: "5rem", fontWeight: "800", color: "#38bdf8", margin: "10px 0" },
  patientMeta: { fontSize: "1.1rem", marginBottom: "25px" },
  nextBtn: { color: "#fff", border: "none", padding: "18px", borderRadius: "12px", width: "100%", fontWeight: "bold", cursor: "pointer" },
  queueContainer: { background: "#fff", borderRadius: "20px", padding: "25px" },
  queueHeader: { display: "flex", justifyContent: "space-between", marginBottom: "20px" },
  queueCount: { background: "#dcfce7", color: "#166534", padding: "2px 10px", borderRadius: "10px", fontSize: "12px" },
  queueItem: { display: "flex", alignItems: "center", padding: "15px", background: "#f1f5f9", borderRadius: "12px", marginBottom: "10px" },
  itemToken: { width: "60px", fontWeight: "bold", color: "#3b82f6" },
  itemName: { flex: 1, fontWeight: "500" },
  emergencyTag: { background: "#ef4444", color: "#fff", fontSize: "10px", padding: "2px 6px", borderRadius: "4px", marginLeft: "5px" },
  itemTime: { color: "#10b981", fontSize: "11px", fontWeight: "bold" },
  emptyState: { textAlign: "center", color: "#94a3b8", marginTop: "40px" }
};