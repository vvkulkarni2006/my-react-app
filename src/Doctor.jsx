import React, { useState, useEffect } from "react";

const API = "http://127.0.0.1:5055";
const ding = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");

export default function Doctor({ logout }) {
  const [logged, setLogged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ward, setWard] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [queue, setQueue] = useState([]);
  const [nowServing, setNowServing] = useState(null);
  const [prevCheckedInCount, setPrevCheckedInCount] = useState(0);
  const [onBreak, setOnBreak] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    if (!username || !password) return alert("Please enter credentials");
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      setTimeout(() => {
        if (!res.ok) {
          alert(data.message);
          setIsLoading(false);
          return;
        }
        setWard(data.ward);
        setDoctor(data.doctor);
        setOnBreak(data.doctor.onBreak);
        setLogged(true);
        setIsLoading(false);
      }, 1500);
    } catch (e) { 
      setIsLoading(false);
      alert(`Server Offline on ${API}`); 
    }
  };

  const load = async () => {
    if (!ward) return;
    try {
      const res = await fetch(`${API}/api/queue/${ward}`);
      const data = await res.json();
      const currentQueue = data.queue || [];
      const checkedInPatients = currentQueue.filter(p => p.checkedIn);
      if (checkedInPatients.length > prevCheckedInCount) {
        ding.play().catch(() => {});
      }
      setQueue(currentQueue);
      setNowServing(data.nowServing || null);
      setOnBreak(data.doctor.onBreak);
      setPrevCheckedInCount(checkedInPatients.length);
    } catch (err) { console.error(err); }
  };

  const toggleBreak = async () => {
    try {
      const res = await fetch(`${API}/api/toggle-break/${ward}`, { method: "POST" });
      const data = await res.json();
      setOnBreak(data.onBreak);
      load();
    } catch (e) { console.error(e); }
  };

  const handleAction = async () => {
    const endpoint = verifiedQueue.length > 0 ? "call-next" : "finish-consultation";
    try {
      const res = await fetch(`${API}/api/${endpoint}/${ward}`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message);
      }
      load(); 
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (logged && ward) {
      load();
      const t = setInterval(load, 3000);
      return () => clearInterval(t);
    }
  }, [logged, ward]);

  const verifiedQueue = queue.filter(p => p.checkedIn);

  if (!logged) {
    return (
      <div style={styles.loginOverlay}>
        <div style={styles.leftPanel}>
          <div style={styles.brandBadge}>PHYSICIAN PORTAL v2.0</div>
          <h1 style={styles.panelTitle}>Clinical <span style={{color: '#2563eb'}}>Excellence</span></h1>
          <p style={styles.panelSubtitle}>Empowering doctors with real-time patient data.</p>
          <div style={styles.statGrid}>
            <div style={styles.miniCard}>
              <span style={styles.statEmoji}>🏥</span>
              <div>
                <small style={styles.statLabel}>WARD LOAD</small>
                <p style={styles.statVal}>Optimal</p>
              </div>
            </div>
            <div style={styles.miniCard}>
              <span style={styles.statEmoji}>⭐</span>
              <div>
                <small style={styles.statLabel}>AVG RATING</small>
                <p style={styles.statVal}>4.9/5.0</p>
              </div>
            </div>
          </div>
          <div style={styles.securityText}>🛡️ HIPAA Compliant | Secure Provider Login</div>
        </div>
        <div style={styles.loginCard}>
          {isLoading ? (
            <div style={styles.loaderContainer}>
              <svg width="150" height="50" viewBox="0 0 150 50">
                <path d="M0,25 L30,25 L35,10 L45,40 L50,25 L150,25" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" style={styles.heartbeatPath} />
              </svg>
              <p style={styles.loaderText}>SYNCING CLINICAL DATA...</p>
            </div>
          ) : (
            <>
              <div style={styles.loginHeader}>
                <h2 style={{margin: '0 0 5px 0', color: '#1e293b'}}>Doctor Login</h2>
                <p style={{fontSize: '13px', color: '#64748b', margin: 0}}>Access your consultations and queue</p>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>PROVIDER ID</label>
                <input style={styles.input} placeholder="e.g. DOC-992" onChange={e => setUsername(e.target.value)} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>PASSPHRASE</label>
                <input style={styles.input} type="password" placeholder="••••••••" onChange={e => setPassword(e.target.value)} />
              </div>
              <button style={styles.loginBtn} onClick={login}>Enter Dashboard</button>
              <button style={styles.backBtn} onClick={logout}>← Back to Home</button>
            </>
          )}
        </div>
        <style>{`@keyframes drawHeartbeat { 0% { stroke-dashoffset: 600; } 100% { stroke-dashoffset: 0; } }`}</style>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.dashHeader}>
        <div style={styles.doctorInfo}>
          <div style={styles.docAvatar}>{doctor?.name?.charAt(0)}</div>
          <div>
            <h2 style={styles.docName}>Dr. {doctor?.name} {onBreak && <span style={{color: '#f43f5e', fontSize: '12px'}}>(ON BREAK)</span>}</h2>
            <div style={styles.wardTag}>{ward} Department</div>
          </div>
        </div>
        <div style={styles.headerRight}>
            <button onClick={toggleBreak} style={{...styles.breakBtn, backgroundColor: onBreak ? '#10b981' : '#f59e0b'}}>
              {onBreak ? "End Break" : "Go on Break"}
            </button>
            <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </header>

      <div style={styles.mainContent}>
        <div style={styles.servingCard}>
          {onBreak ? (
             <div style={{padding: '20px', color: '#f59e0b'}}>
                <div style={{fontSize: '50px'}}>☕</div>
                <h3>Break Mode Active</h3>
                <p>Registration times are being adjusted.</p>
             </div>
          ) : (
            <>
              <p style={styles.cardLabel}>CURRENTLY CONSULTING</p>
              <div style={styles.tokenDisplay}>{nowServing ? nowServing.token : "---"}</div>
              <div style={styles.patientInfoBox}>
                <h3 style={styles.patientMetaName}>{nowServing ? nowServing.name : "Ready to begin"}</h3>
                {nowServing?.vitals && (
                  <div style={styles.vitalsBox}>
                    <span>🌡️ {nowServing.vitals.temp}°F</span>
                    <span>🩸 {nowServing.vitals.bp} BP</span>
                  </div>
                )}
                <p style={styles.patientSubText}>{nowServing ? "Consultation in progress" : "No active session"}</p>
              </div>
              <button 
                style={{...styles.nextBtn, background: verifiedQueue.length > 0 ? "#2563eb" : (nowServing ? "#f43f5e" : "#cbd5e1"), cursor: (verifiedQueue.length > 0 || nowServing) ? "pointer" : "not-allowed"}} 
                onClick={handleAction}
                disabled={verifiedQueue.length === 0 && !nowServing}
              >
                {verifiedQueue.length > 0 ? "Call Next Patient" : (nowServing ? "Finish Consultation" : "Queue Empty")}
              </button>
            </>
          )}
        </div>

        <div style={styles.queueContainer}>
          <div style={styles.queueHeader}>
            <h3 style={{color: '#1e293b', margin: 0}}>Verified Waiting Room</h3>
            <span style={styles.queueCount}>{verifiedQueue.length} Present</span>
          </div>
          <div style={styles.scrollArea}>
            {verifiedQueue.length === 0 ? (
              <div style={styles.emptyState}><p>Waiting for patients...</p></div>
            ) : (
              verifiedQueue.map(p => (
                <div key={p.token} style={styles.queueItem}>
                  <div style={styles.itemToken}>{p.token}</div>
                  <div style={styles.itemName}>
                    <div style={{fontWeight: '700', fontSize: '16px'}}>{p.name}</div>
                    {p.vitals && <div style={{fontSize: '12px', color: '#64748b', marginTop: '4px'}}>Temp: {p.vitals.temp}°F | BP: {p.vitals.bp}</div>}
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={styles.statusChip}>Ready</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  loginOverlay: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)', fontFamily: 'sans-serif', gap: '60px' },
  leftPanel: { maxWidth: '400px', textAlign: 'left' },
  brandBadge: { background: '#dbeafe', color: '#1e40af', padding: '5px 12px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', display: 'inline-block', marginBottom: '15px' },
  panelTitle: { fontSize: '3rem', fontWeight: '900', color: '#0f172a', margin: '0' },
  panelSubtitle: { fontSize: '1.1rem', color: '#64748b', marginBottom: '40px' },
  statGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  miniCard: { background: '#fff', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.03)' },
  statEmoji: { fontSize: '24px' },
  statLabel: { color: '#94a3b8', fontWeight: '700', fontSize: '9px' },
  statVal: { color: '#1e293b', fontWeight: '800', margin: 0 },
  securityText: { marginTop: '40px', fontSize: '12px', color: '#94a3b8', fontWeight: '600' },
  loginCard: { background: '#fff', padding: '50px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', width: '400px', textAlign: 'center' },
  loginHeader: { marginBottom: '30px', textAlign: 'left' },
  inputGroup: { marginBottom: '20px', textAlign: 'left' },
  label: { display: 'block', fontSize: '10px', fontWeight: '800', color: '#2563eb', marginBottom: '6px' },
  input: { width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', boxSizing: 'border-box', outline: 'none', background: '#f8fafc' },
  loginBtn: { width: '100%', padding: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', marginBottom: '15px', fontSize: '14px' },
  backBtn: { width: '100%', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', marginTop: '10px' },
  loaderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '200px', justifyContent: 'center' },
  heartbeatPath: { strokeDasharray: 600, strokeDashoffset: 600, animation: 'drawHeartbeat 1.5s linear infinite' },
  loaderText: { marginTop: '20px', color: '#2563eb', fontWeight: '800', fontSize: '12px', letterSpacing: '2px' },
  dashboardContainer: { padding: "25px", background: "#f1f5f9", minHeight: "100vh", fontFamily: "sans-serif" },
  dashHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "15px 30px", borderRadius: "20px", boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  doctorInfo: { display: "flex", alignItems: "center", gap: "15px" },
  docAvatar: { width: "45px", height: "45px", background: "#dbeafe", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", fontWeight: "800" },
  docName: { margin: 0, fontSize: "18px" },
  wardTag: { fontSize: "12px", color: "#64748b" },
  headerRight: { display: 'flex', gap: '15px' },
  breakBtn: { padding: '8px 15px', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  logoutBtn: { color: "#f43f5e", background: "none", border: "none", fontWeight: "700", cursor: "pointer" },
  mainContent: { display: "grid", gridTemplateColumns: "380px 1fr", gap: "25px", marginTop: "25px" },
  servingCard: { background: "#fff", padding: "40px 30px", borderRadius: "24px", textAlign: "center", boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' },
  cardLabel: { fontSize: "12px", letterSpacing: "1.5px", color: "#64748b", fontWeight: "700" },
  tokenDisplay: { fontSize: "5rem", fontWeight: "900", color: "#2563eb" },
  patientInfoBox: { marginBottom: "35px" },
  patientMetaName: { fontSize: "1.5rem", margin: "0 0 5px 0" },
  vitalsBox: { display: 'flex', justifyContent: 'center', gap: '15px', margin: '10px 0', fontSize: '14px', color: '#475569', fontWeight: 'bold' },
  patientSubText: { fontSize: "14px", color: "#94a3b8" },
  nextBtn: { color: "#fff", border: "none", padding: "18px", borderRadius: "14px", width: "100%", fontWeight: "800", transition: 'all 0.3s ease' },
  queueContainer: { background: "#fff", borderRadius: "24px", padding: "30px", display: 'flex', flexDirection: 'column', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' },
  queueHeader: { display: "flex", justifyContent: "space-between", marginBottom: "25px" },
  queueCount: { background: "#dcfce7", color: "#166534", padding: "6px 14px", borderRadius: "12px", fontSize: "13px", fontWeight: '700' },
  scrollArea: { flex: 1, overflowY: 'auto' },
  
  // UPDATED: Grid layout for perfect column alignment
  queueItem: { 
    display: "grid", 
    gridTemplateColumns: "150px 1fr 100px", // Fixed 150px for Token, flex for Name, 100px for Status
    alignItems: "center", 
    padding: "20px", 
    background: "#f8fafc", 
    borderRadius: "16px", 
    marginBottom: "12px" 
  },
  itemToken: { 
    fontWeight: "900", 
    color: "#2563eb", 
    fontSize: "22px", 
    borderRight: '2px solid #e2e8f0', 
    paddingRight: '15px' 
  },
  itemName: { 
    paddingLeft: '25px', // Deep padding to ensure text never touches the token
  },
  statusChip: { color: "#10b981", background: "#f0fdf4", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
  emptyState: { textAlign: "center", color: "#94a3b8", marginTop: "80px" }
};