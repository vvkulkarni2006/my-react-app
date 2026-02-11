import React, { useEffect, useState } from "react";
const API = "http://127.0.0.1:5055/api";

export default function WardDisplay({ ward }) {
  const [queue, setQueue] = useState([]);
  const [nowServing, setNowServing] = useState(null);
  const [doctor, setDoctor] = useState(null);

  const load = async () => {
    try {
      const res = await fetch(`${API}/queue/${ward}`);
      const data = await res.json();
      // Only show checked-in patients in the waiting list
      setQueue(data.queue.filter(p => p.checkedIn));
      setNowServing(data.nowServing);
      setDoctor(data.doctor);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [ward]);

  useEffect(() => {
    if (nowServing) {
      const msg = new SpeechSynthesisUtterance();
      msg.text = `Attention. Token Number ${nowServing.token}, please proceed to Dr. ${doctor?.name}`;
      msg.rate = 0.9;
      window.speechSynthesis.speak(msg);
    }
  }, [nowServing?.token]);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3>{ward}</h3>
        <small>Dr. {doctor?.name || "Loading..."}</small>
      </div>
      <div style={styles.now}>
        <div style={{fontSize: '12px', fontWeight: '800'}}>NOW SERVING</div>
        <div style={styles.token}>{nowServing ? nowServing.token : "—"}</div>
        <div style={{fontSize: '14px'}}>{nowServing ? nowServing.name : "Waiting..."}</div>
      </div>
      <div style={{marginTop: '20px'}}>
        {queue.slice(0, 3).map(p => (
          <div key={p.token} style={{...styles.row, background: p.emergency ? "#fff1f2" : "#f8fafc"}}>
            <b>{p.token}</b> <span>{p.name}</span> <small>Arrived</small>
          </div>
        ))}
        {queue.length === 0 && <p style={{fontSize: '12px', textAlign: 'center', color: '#94a3b8'}}>No other patients in clinic.</p>}
      </div>
    </div>
  );
}

const styles = {
  card: { background: "#fff", padding: "20px", borderRadius: "18px", boxShadow: "0 10px 20px rgba(0,0,0,0.1)" },
  now: { background: "#0d6efd", color: "#fff", padding: "20px", borderRadius: "15px", textAlign: "center" },
  token: { fontSize: "48px", fontWeight: "900", margin: "5px 0" },
  row: { display: "flex", justifyContent: "space-between", padding: "12px", borderRadius: "10px", marginBottom: "8px" }
};