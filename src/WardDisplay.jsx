import React, { useEffect, useState } from "react";

const API = "http://localhost:5055";

export default function WardDisplay({ ward }) {
  const [queue, setQueue] = useState([]);
  const [nowServing, setNowServing] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");

  const load = async () => {
    try {
      const res = await fetch(`${API}/api/queue/${ward}`);
      const data = await res.json();
      
      setQueue(data.queue ? data.queue.filter(p => p.checkedIn) : []);
      setNowServing(data.nowServing || null);
      setDoctor(data.doctor || null);
      // Update the timestamp every time data is fetched
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
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
      msg.text = `Attention please. Token Number ${nowServing.token}, kindly proceed to the ${ward} ward. Thank you.`;
      msg.rate = 0.85;
      window.speechSynthesis.speak(msg);
    }
  }, [nowServing?.token, ward]);

  // Helper to determine wait intensity
  const getIntensity = () => {
    if (queue.length > 10) return { label: "High Volume", color: "#e11d48" };
    if (queue.length > 5) return { label: "Moderate", color: "#f59e0b" };
    return { label: "Fast Flow", color: "#10b981" };
  };

  const intensity = getIntensity();

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem' }}>{ward}</h3>
            <small style={{ color: '#64748b', fontWeight: '500' }}>
              {doctor ? `Dr. ${doctor.name}` : "Assigning Doctor..."}
            </small>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ ...styles.intensityBadge, color: intensity.color, borderColor: intensity.color }}>
              {intensity.label}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Sync: {lastUpdated}</div>
          </div>
        </div>
      </div>

      <div style={styles.now}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <div style={styles.pulse}></div>
          <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px' }}>NOW SERVING</span>
        </div>
        <div style={styles.token}>{nowServing ? nowServing.token : "—"}</div>
        <div style={{ fontSize: '15px', fontWeight: '700', textTransform: 'uppercase' }}>
          {nowServing ? nowServing.name : "Waiting for Patient"}
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <div style={styles.upcomingHeader}>
          <span>UPCOMING QUEUE</span>
          <span>{queue.length} Total</span>
        </div>
        
        {queue.slice(0, 4).map((p, index) => (
          <div key={p.token} style={{ 
            ...styles.row, 
            background: p.emergency ? "#fff1f2" : "#f8fafc",
            borderLeft: p.emergency ? "4px solid #e11d48" : "4px solid #e2e8f0"
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <b style={{ color: p.emergency ? "#e11d48" : "#0d6efd", fontSize: '16px' }}>{p.token}</b>
              <span style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{p.name}</span>
            </div>
            {p.emergency ? (
              <span style={styles.emergencyTag}>PRIORITY</span>
            ) : (
              <small style={{ color: '#64748b', fontSize: '11px' }}>Est. {index * 5 + 5}m</small>
            )}
          </div>
        ))}
        
        {queue.length === 0 && !nowServing && (
          <div style={styles.emptyState}>
            <span style={{ fontSize: '24px' }}>☕</span>
            <p style={{ margin: '5px 0 0 0' }}>Ward currently clear</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: { background: "#fff", padding: "20px", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9", height: '100%' },
  header: { marginBottom: "15px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" },
  intensityBadge: { fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', border: '1px solid', textTransform: 'uppercase' },
  now: { background: "#0f172a", color: "#fff", padding: "24px 20px", borderRadius: "16px", textAlign: "center", position: 'relative', overflow: 'hidden' },
  pulse: { width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' },
  token: { fontSize: "56px", fontWeight: "900", margin: "2px 0", lineHeight: 1 },
  upcomingHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: '#94a3b8', marginBottom: '12px', letterSpacing: '0.5px' },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: "8px", marginBottom: "8px", transition: '0.2s' },
  emergencyTag: { background: "#e11d48", color: "#fff", fontSize: "9px", fontWeight: "900", padding: "2px 6px", borderRadius: "4px" },
  emptyState: { textAlign: 'center', color: '#94a3b8', fontSize: '12px', padding: '20px' }
};