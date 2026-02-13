import React, { useEffect, useState } from "react";

const API = "https://my-react-app-ssib.onrender.com";

export default function WardDisplay({ ward }) {
  const [queue, setQueue] = useState([]);
  const [nowServing, setNowServing] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");

  const load = async () => {
    try {
      const res = await fetch(`${API}/api/queue/${ward}?t=${Date.now()}`);
      const data = await res.json();
      setQueue(data.queue ? data.queue.filter(p => p.checkedIn) : []);
      setNowServing(data.nowServing || null);
      setDoctor(data.doctor || null);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.error("WardDisplay Fetch Error:", e);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [ward]);

  useEffect(() => {
    if (nowServing && nowServing.token) {
      const msg = new SpeechSynthesisUtterance();
      msg.text = `Attention please. Token Number ${nowServing.token}, kindly proceed to the ${ward} ward.`;
      msg.rate = 0.85;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(msg);
    }
  }, [nowServing?.token, ward]);

  const intensity = queue.length > 10 ? { label: "Busy", color: "#e11d48" } : { label: "Stable", color: "#10b981" };

  return (
    <div style={styles.card}>
      {/* Top Header Section */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.wardInfo}>
            <span style={styles.deptLabel}>DEPARTMENT</span>
            <h3 style={styles.wardTitle}>{ward}</h3>
          </div>
          <div style={styles.doctorBadge}>
            <span style={styles.docIcon}>👨‍⚕️</span>
            <span>{doctor ? `Dr. ${doctor.name}` : "Off Duty"}</span>
          </div>
        </div>
      </div>

      {/* Hero "Now Serving" Section */}
      <div style={styles.nowContainer}>
        <div style={styles.servingGlow}></div>
        <div style={styles.pulseContainer}>
          <div style={styles.pulseRing}></div>
          <span style={styles.servingLabel}>CURRENTLY SERVING</span>
        </div>
        <div style={styles.tokenNumber}>{nowServing ? nowServing.token : "---"}</div>
        <div style={styles.patientName}>
          {nowServing ? nowServing.name : "Ready for next patient"}
        </div>
      </div>

      {/* Queue List Section */}
      <div style={styles.queueWrapper}>
        <div style={styles.queueHeader}>
          <span style={styles.qTitle}>UPCOMING PATIENTS</span>
          <span style={{...styles.intensityBadge, color: intensity.color}}>{intensity.label}</span>
        </div>
        
        <div style={styles.scrollArea}>
          {queue.slice(0, 5).map((p, index) => (
            <div key={p.token} style={{...styles.row, borderLeftColor: p.emergency ? "#e11d48" : "#3b82f6"}}>
              <div style={styles.rowLeft}>
                <span style={styles.rowToken}>{p.token}</span>
                <span style={styles.rowName}>{p.name}</span>
              </div>
              {p.emergency ? <span style={styles.emergTag}>SOS</span> : <span style={styles.timeTag}>{index * 5 + 5}m</span>}
            </div>
          ))}
          {queue.length === 0 && <div style={styles.empty}>Ward is currently quiet</div>}
        </div>
      </div>

      {/* Footer Footer Sync Bar */}
      <div style={styles.footer}>
        <span>System Active</span>
        <span>Last Sync: {lastUpdated}</span>
      </div>

      <style>{`
        @keyframes rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 0.5; transform: scale(1); } 100% { opacity: 0; transform: scale(1.5); } }
      `}</style>
    </div>
  );
}

const styles = {
  card: { background: "#ffffff", padding: "24px", borderRadius: "32px", boxShadow: "0 20px 40px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", height: '100%', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  deptLabel: { fontSize: '10px', fontWeight: '800', color: '#94a3b8', letterSpacing: '1.5px' },
  wardTitle: { margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: '900' },
  doctorBadge: { background: '#f1f5f9', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' },
  
  nowContainer: { background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", padding: "40px 20px", borderRadius: "24px", textAlign: "center", position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.2)' },
  servingLabel: { color: '#38bdf8', fontSize: '12px', fontWeight: '900', letterSpacing: '2px' },
  tokenNumber: { fontSize: "80px", fontWeight: "950", color: "#fff", margin: "10px 0", textShadow: '0 0 20px rgba(56, 189, 248, 0.3)' },
  patientName: { color: '#94a3b8', fontSize: '16px', fontWeight: '600', textTransform: 'uppercase' },
  
  queueWrapper: { flex: 1 },
  queueHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px' },
  qTitle: { fontSize: '11px', fontWeight: '900', color: '#64748b' },
  intensityBadge: { fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' },
  
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#f8fafc', borderRadius: '16px', marginBottom: '10px', borderLeft: '5px solid' },
  rowToken: { fontWeight: '900', color: '#1e293b', fontSize: '18px', marginRight: '15px' },
  rowName: { fontWeight: '600', color: '#475569' },
  emergTag: { background: '#fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900' },
  timeTag: { fontSize: '11px', color: '#94a3b8', fontWeight: '700' },
  
  footer: { display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: '800', color: '#cbd5e1', textTransform: 'uppercase', borderTop: '1px solid #f1f5f9', paddingTop: '15px' },
  empty: { textAlign: 'center', color: '#94a3b8', padding: '40px', fontSize: '14px' }
};