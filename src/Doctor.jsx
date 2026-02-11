import React, { useState, useEffect } from "react";

const API = "http://127.0.0.1:5055/api";
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
  const [dark, setDark] = useState(true);

  const login = async () => {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message);
    setWard(data.ward);
    setDoctor(data.doctor);
    setLogged(true);
  };

  const load = async () => {
    if (!ward) return;
    const res = await fetch(`${API}/queue/${ward}`);
    const data = await res.json();
    
    setQueue(data.queue);
    setNowServing(data.nowServing);

    const currentCheckedIn = data.queue.filter(p => p.checkedIn).length;
    if (currentCheckedIn > prevCheckedInCount) {
      ding.play().catch(() => console.log("Click page to enable audio"));
    }
    setPrevCheckedInCount(currentCheckedIn);
  };

  const callNext = async () => {
    const res = await fetch(`${API}/call-next/${ward}`, { method: "POST" });
    if (!res.ok) {
      const err = await res.json();
      return alert(err.message);
    }
    load();
  };

  useEffect(() => {
    if (logged && ward) {
      load();
      const t = setInterval(load, 3000);
      return () => clearInterval(t);
    }
  }, [logged, ward, prevCheckedInCount]);

  // UI Filtering
  const verifiedQueue = queue.filter(p => p.checkedIn);
  const ghostCount = queue.filter(p => !p.checkedIn).length;

  if (!logged) {
    return (
      <div style={dark ? styles.loginPageDark : styles.loginPageLight}>
        <div style={styles.glassWrapper}>
          <div style={dark ? styles.loginCardDark : styles.loginCardLight}>
            <div style={styles.loginHeader}>
              <div style={styles.avatarIcon}>🩺</div>
              <h2 style={dark ? styles.titleDark : styles.titleLight}>Doctor Portal</h2>
            </div>
            <div style={styles.inputGroup}>
              <label style={dark ? styles.labelDark : styles.labelLight}>Username</label>
              <input style={dark ? styles.inputDark : styles.inputLight} value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div style={styles.inputGroup}>
              <label style={dark ? styles.labelDark : styles.labelLight}>Password</label>
              <input style={dark ? styles.inputDark : styles.inputLight} type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button style={styles.loginBtn} onClick={login}>Secure Login</button>
            <div style={styles.loginFooter}>
              <button style={styles.backBtn} onClick={logout}>← Return Home</button>
              <button style={styles.themeToggle} onClick={() => setDark(!dark)}>{dark ? "☀️ Light" : "🌙 Dark"}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.dashHeader}>
        <div style={styles.doctorInfo}>
          <div style={styles.docAvatar}>{doctor?.name?.charAt(0)}</div>
          <div><h2 style={styles.docName}>Dr. {doctor?.name}</h2><span style={styles.deptBadge}>{ward}</span></div>
        </div>
        <button style={styles.logoutBtn} onClick={logout}>End Session</button>
      </header>

      <div style={styles.mainContent}>
        <div style={styles.servingCard}>
          <p style={styles.cardLabel}>CURRENTLY SERVING</p>
          <div style={styles.tokenDisplay}>{nowServing ? nowServing.token : "WAITING"}</div>
          <p style={styles.patientMeta}>{nowServing ? nowServing.name : "Ready"}</p>
          <button style={{...styles.nextBtn, opacity: verifiedQueue.length === 0 ? 0.5 : 1}} onClick={callNext} disabled={verifiedQueue.length === 0}>
            {verifiedQueue.length === 0 ? "Waiting for Check-ins" : "Call Next Patient →"}
          </button>
          <p style={{fontSize: '11px', color: '#64748b', marginTop: '10px'}}>{ghostCount} booked online but not present</p>
        </div>

        <div style={styles.queueContainer}>
          <div style={styles.queueHeader}><h3>Patients in Clinic</h3><span style={styles.queueCount}>{verifiedQueue.length} Present</span></div>
          <div style={styles.listWrapper}>
            {verifiedQueue.length === 0 ? <div style={styles.emptyState}>No patients verified at reception yet.</div> :
              verifiedQueue.map((p, i) => (
                <div key={p.token} style={styles.queueItem}>
                  <div style={styles.itemToken}>{p.token}</div>
                  <div style={styles.itemName}>{p.name} {p.emergency && <span style={styles.emergencyTag}>EMG</span>}</div>
                  <div style={styles.itemTime}>Verified ✓</div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  loginPageDark: { minHeight: "90vh", display: "flex", justifyContent: "center", alignItems: "center" },
  loginCardDark: { background: "#0f172a", padding: "40px", borderRadius: "24px", textAlign: "center", color: "#fff" },
  dashboardContainer: { padding: "20px" },
  dashHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "20px", borderRadius: "20px" },
  doctorInfo: { display: "flex", alignItems: "center", gap: "15px" },
  docAvatar: { width: "50px", height: "50px", background: "#3b82f6", borderRadius: "15px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" },
  mainContent: { display: "grid", gridTemplateColumns: "350px 1fr", gap: "25px", marginTop: "20px" },
  servingCard: { background: "#1e293b", color: "#fff", padding: "40px", borderRadius: "24px", textAlign: "center" },
  tokenDisplay: { fontSize: "5rem", fontWeight: "800", color: "#38bdf8" },
  nextBtn: { background: "#10b981", color: "#fff", border: "none", padding: "18px", borderRadius: "15px", cursor: "pointer", width: "100%" },
  queueContainer: { background: "#fff", borderRadius: "24px", padding: "30px" },
  queueItem: { display: "flex", alignItems: "center", padding: "15px", background: "#f8fafc", borderRadius: "15px", marginBottom: "10px" },
  itemToken: { width: "60px", fontWeight: "800", color: "#3b82f6" },
  itemName: { flex: 1, fontWeight: "600" },
  emergencyTag: { background: "#ef4444", color: "#fff", fontSize: "10px", padding: "2px 8px", borderRadius: "4px" },
  itemTime: { color: "#10b981", fontSize: "12px", fontWeight: "bold" }
};