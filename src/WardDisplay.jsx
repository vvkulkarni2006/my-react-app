import React, { useEffect, useState } from "react";

// Use environment variable for live URL or fallback to localhost
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5055";

export default function WardDisplay({ ward }) {
  const [queue, setQueue] = useState([]);
  const [nowServing, setNowServing] = useState(null);
  const [doctor, setDoctor] = useState(null);

  const load = async () => {
    try {
      // Added /api prefix to match your backend routes
      const res = await fetch(`${API}/api/queue/${ward}`);
      const data = await res.json();
      
      // Only show checked-in patients in the waiting list
      setQueue(data.queue ? data.queue.filter(p => p.checkedIn) : []);
      setNowServing(data.nowServing || null);
      setDoctor(data.doctor || null);
    } catch (e) { 
      console.error("WardDisplay Fetch Error:", e); 
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 3000); // Refresh every 3 seconds
    return () => clearInterval(t);
  }, [ward]);

  // Voice Announcement Logic
  useEffect(() => {
    if (nowServing && nowServing.token) {
      const msg = new SpeechSynthesisUtterance();
      msg.text = `Attention please. Token Number ${nowServing.token}, kindly proceed to the ${ward} ward. Thank you.`;
      msg.rate = 0.85;
      window.speechSynthesis.speak(msg);
    }
  }, [nowServing?.token]);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={{margin: 0, color: '#1e293b'}}>{ward}</h3>
        <small style={{color: '#64748b'}}>Dr. {doctor?.name || "Loading..."}</small>
      </div>

      <div style={styles.now}>
        <div style={{fontSize: '12px', fontWeight: '800', letterSpacing: '1px'}}>NOW SERVING</div>
        <div style={styles.token}>{nowServing ? nowServing.token : "—"}</div>
        <div style={{fontSize: '14px', fontWeight: '600'}}>{nowServing ? nowServing.name : "Waiting..."}</div>
      </div>

      <div style={{marginTop: '20px'}}>
        <div style={{fontSize: '11px', fontWeight: '700', color: '#94a3b8', marginBottom: '10px'}}>UPCOMING</div>
        {queue.slice(0, 3).map(p => (
          <div key={p.token} style={{...styles.row, background: p.emergency ? "#fff1f2" : "#f8fafc"}}>
            <b style={{color: p.emergency ? "#e11d48" : "#0d6efd"}}>{p.token}</b> 
            <span style={{fontSize: '14px', color: '#334155'}}>{p.name}</span> 
            <small style={{color: '#10b981', fontWeight: '700'}}>Verified</small>
          </div>
        ))}
        {queue.length === 0 && (
          <p style={{fontSize: '12px', textAlign: 'center', color: '#94a3b8', padding: '10px'}}>
            No other patients in waiting area.
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: { 
    background: "#fff", 
    padding: "20px", 
    borderRadius: "18px", 
    boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
    border: "1px solid #f1f5f9"
  },
  header: {
    marginBottom: "15px",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "10px"
  },
  now: { 
    background: "#0d6efd", 
    color: "#fff", 
    padding: "20px", 
    borderRadius: "15px", 
    textAlign: "center",
    boxShadow: "0 8px 15px rgba(13, 110, 253, 0.2)"
  },
  token: { fontSize: "48px", fontWeight: "900", margin: "5px 0" },
  row: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center",
    padding: "12px", 
    borderRadius: "10px", 
    marginBottom: "8px" 
  }
};