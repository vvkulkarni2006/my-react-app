const API = import.meta.env.VITE_API_URL || "http://localhost:5055";
import React, { useState, useEffect } from "react";
import Patient from "./Patient";
import Doctor from "./Doctor";
import WardDisplay from "./WardDisplay";
import Receptionist from "./Receptionist"; // Ensure this file exists



export default function App() {
  const [page, setPage] = useState("welcome");
  const [totalServed, setTotalServed] = useState(0);

  useEffect(() => {
    document.title = "Ayushman Bharat | Smart OPD";
  }, []);

  useEffect(() => {
    if (page === "bigscreen") {
      const fetchStats = async () => {
        try {
          const res = await fetch(`${API}/stats`);
          const data = await res.json();
          setTotalServed(data.totalServed);
        } catch (e) { console.error(e); }
      };
      fetchStats();
      const i = setInterval(fetchStats, 5000);
      return () => clearInterval(i);
    }
  }, [page]);

  return (
    <div style={styles.appWrapper}>
      <div style={styles.overlay}></div>
      <div style={styles.contentContainer}>
        {page === "welcome" && (
          <div style={styles.heroSection}>
            <div style={styles.glassCard}>
              <div style={styles.badge}>Healthcare Excellence</div>
              <h1 style={styles.mainTitle}>Ayushman Bharat <span style={styles.highlight}>Hospital</span></h1>
              <p style={styles.description}>Experience a seamless healthcare journey with our Smart OPD System.</p>
              
              <div style={styles.actionGrid}>
                <button style={{ ...styles.actionCard, ...styles.patientCard }} onClick={() => setPage("patient")}>
                  <div style={styles.iconCircle}>📋</div>
                  <h3>Patient Portal</h3>
                  <p>Register and check your status</p>
                </button>
                
                <button style={{ ...styles.actionCard, ...styles.receptionCard }} onClick={() => setPage("receptionist")}>
                  <div style={styles.iconCircle}>🏢</div>
                  <h3>Reception Desk</h3>
                  <p>QR Scanner & Check-in</p>
                </button>

                <button style={{ ...styles.actionCard, ...styles.doctorCard }} onClick={() => setPage("doctor")}>
                  <div style={styles.iconCircle}>👨‍⚕️</div>
                  <h3>Doctor Login</h3>
                  <p>Manage consultations</p>
                </button>
              </div>
              
              <button style={styles.monitorBtn} onClick={() => setPage("bigscreen")}>🖥️ View Live OPD Monitor</button>
            </div>
          </div>
        )}

        {page === "patient" && <div style={styles.subPageContainer}><Patient logout={() => setPage("welcome")} /></div>}
        {page === "doctor" && <div style={styles.subPageContainer}><Doctor logout={() => setPage("welcome")} /></div>}
        {page === "receptionist" && <div style={styles.subPageContainer}><Receptionist logout={() => setPage("welcome")} /></div>}

        {page === "bigscreen" && (
          <div style={styles.monitorContainer}>
            <div style={styles.statsBar}>
               <div style={styles.statItem}>
                  <span style={styles.statLabel}>TOTAL SERVED TODAY</span>
                  <span style={styles.statValue}>{totalServed} Patients</span>
               </div>
               <div style={styles.statItem}>
                  <span style={styles.statLabel}>LIVE CLOCK</span>
                  <span style={styles.statValue}>{new Date().toLocaleTimeString()}</span>
               </div>
               <div style={styles.statItem}>
                  <span style={styles.statLabel}>HOSPITAL STATUS</span>
                  <span style={{...styles.statValue, color: '#10b981'}}>● OPERATIONAL</span>
               </div>
            </div>

            <div style={styles.monitorHeader}>
              <div>
                <h2 style={styles.monitorTitle}>Live OPD Queue Display</h2>
                <div style={styles.tickerContainer}>
                  <marquee>📢 WELCOME TO AYUSHMAN BHARAT HOSPITAL. PLEASE MAINTAIN SILENCE. CONTACT HELP DESK FOR ANY ASSISTANCE.</marquee>
                </div>
              </div>
              <button style={styles.exitBtn} onClick={() => setPage("welcome")}>Return Home</button>
            </div>

            <div style={styles.queueGrid}>
              <WardDisplay ward="Gynecologist" />
              <WardDisplay ward="Orthopedic" />
              <WardDisplay ward="Dermatology" />
              <WardDisplay ward="General" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  appWrapper: { minHeight: "100vh", position: "relative", background: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000') center/cover no-repeat fixed", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(135deg, rgba(11, 94, 215, 0.85) 0%, rgba(15, 23, 42, 0.9) 100%)", zIndex: 1 },
  contentContainer: { position: "relative", zIndex: 2, width: "100%", maxWidth: "1200px", padding: "20px" },
  heroSection: { display: "flex", justifyContent: "center" },
  glassCard: { background: "rgba(255, 255, 255, 0.95)", padding: "60px", borderRadius: "30px", textAlign: "center", width: "100%", maxWidth: "1000px" },
  badge: { display: "inline-block", padding: "6px 16px", background: "#e7f1ff", color: "#0d6efd", borderRadius: "50px", fontSize: "14px", fontWeight: "600", marginBottom: "20px" },
  mainTitle: { fontSize: "3.5rem", fontWeight: "800", color: "#1e293b", margin: "0 0 15px 0" },
  highlight: { color: "#0d6efd" },
  description: { fontSize: "1.1rem", color: "#64748b", marginBottom: "40px" },
  actionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "30px" },
  actionCard: { padding: "25px", borderRadius: "20px", border: "none", cursor: "pointer", textAlign: "left", transition: "0.3s" },
  patientCard: { background: "#0d6efd", color: "#fff" },
  receptionCard: { background: "#0f172a", color: "#fff" },
  doctorCard: { background: "#fff", color: "#1e293b", boxShadow: "0 10px 15px rgba(0,0,0,0.1)" },
  iconCircle: { fontSize: "2rem", marginBottom: "15px" },
  monitorBtn: { width: "100%", padding: "18px", borderRadius: "15px", border: "2px solid #0d6efd", background: "transparent", color: "#0d6efd", fontWeight: "600", cursor: "pointer" },
  subPageContainer: { background: "#f8fafc", padding: "40px", borderRadius: "24px" },
  monitorContainer: { background: "rgba(15, 23, 42, 0.95)", padding: "40px", borderRadius: "24px", color: "#fff" },
  monitorHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" },
  monitorTitle: { fontSize: "2rem", margin: 0 },
  tickerContainer: { background: "rgba(59, 130, 246, 0.2)", color: "#3b82f6", padding: "8px", borderRadius: "8px", marginTop: "10px", width: "100%" },
  statsBar: { display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.05)", padding: "15px 30px", borderRadius: "15px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.1)" },
  statItem: { display: "flex", flexDirection: "column" },
  statLabel: { color: "#94a3b8", fontSize: "10px", fontWeight: "800", letterSpacing: "1px" },
  statValue: { color: "#fff", fontSize: "16px", fontWeight: "600" },
  exitBtn: { background: "#ef4444", color: "#fff", border: "none", padding: "12px 28px", borderRadius: "12px", cursor: "pointer" },
  queueGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "25px" }
};