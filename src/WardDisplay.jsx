import { useEffect, useState } from "react";
const API = "http://127.0.0.1:5055/api";

export default function WardDisplay({ ward }) {
  const [queue, setQueue] = useState([]);
  const [nowServing, setNowServing] = useState(null);

  const load = async () => {
    const res = await fetch(`${API}/queue/${ward}`);
    const data = await res.json();
    setQueue(data.queue);
    setNowServing(data.nowServing);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [ward]);

  return (
    <div style={styles.card}>
      <h2>{ward}</h2>

      <div style={styles.now}>
        NOW SERVING
        <div style={styles.token}>
          {nowServing ? nowServing.token : "—"}
        </div>
      </div>

      <div style={styles.queueTitle}>Upcoming Patients</div>

      {queue.slice(0, 5).map(p => (
        <div key={p.token} style={styles.row}>
          {p.token} • {p.name} • {p.estimatedTime}
        </div>
      ))}
    </div>
  );
}

const styles = {
  card: {
    width: "48%",
    background: "#fff",
    padding: 25,
    marginBottom: 20,
    borderRadius: 18,
    boxShadow: "0 15px 35px rgba(0,0,0,0.12)"
  },
  now: {
    background: "#0B5ED7",
    color: "#fff",
    padding: 20,
    borderRadius: 12,
    textAlign: "center",
    marginBottom: 20
  },
  token: {
    fontSize: 40,
    fontWeight: "bold"
  },
  queueTitle: {
    fontWeight: "bold",
    marginBottom: 10
  },
  row: {
    fontSize: 20,
    padding: 8,
    borderBottom: "1px solid #E5E7EB"
  }
};
