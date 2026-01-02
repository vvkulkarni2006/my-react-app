import { useEffect, useState } from "react";
const API = "http://127.0.0.1:5055/api";

export default function Doctor({ logout }) {
  const [ward, setWard] = useState("Gynecologist");
  const [queue, setQueue] = useState([]);
  const [nowServing, setNowServing] = useState(null);

  const load = async () => {
    const res = await fetch(`${API}/queue/${ward}`);
    const data = await res.json();
    setQueue(data.queue);
    setNowServing(data.nowServing);
  };

  const next = async () => {
    await fetch(`${API}/call-next/${ward}`, { method: "POST" });
    load();
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [ward]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2>{ward} Department</h2>

        <select
          style={styles.select}
          onChange={e => setWard(e.target.value)}
        >
          <option>Gynecologist</option>
          <option>Orthopedic</option>
          <option>Dermatology</option>
          <option>General</option>
        </select>

        <div style={styles.now}>
          <h3>Now Serving</h3>
          {nowServing ? (
            <div>
              <b style={styles.token}>
                {nowServing.token}
              </b>{" "}
              – {nowServing.name}
              <br />
              📞 {nowServing.phone}
            </div>
          ) : (
            "—"
          )}
        </div>

        <ul style={styles.list}>
          {queue.map(p => (
            <li
              key={p.token}
              style={{
                ...styles.row,
                background: p.emergency ? "#FEE2E2" : "#F9FAFB"
              }}
            >
              <b style={styles.token}>
                {p.token}
              </b>{" "}
              | {p.name} | {p.estimatedTime}
              {p.emergency && (
                <span style={styles.emergencyText}>
                  {" "}EMERGENCY
                </span>
              )}
            </li>
          ))}
        </ul>

        <button style={styles.primary} onClick={next}>
          Call Next
        </button>

        <button style={styles.link} onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F4F7FB",
    padding: 40
  },
  card: {
    background: "#fff",
    padding: 30,
    borderRadius: 18,
    boxShadow: "0 15px 35px rgba(0,0,0,0.12)"
  },
  select: {
    padding: 10,
    marginBottom: 20,
    borderRadius: 8
  },
  now: {
    padding: 20,
    background: "#0B5ED7",
    color: "#fff",
    borderRadius: 12,
    marginBottom: 20
  },
  list: {
    listStyle: "none",
    padding: 0
  },
  row: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8
  },
  token: {
    color: "#0B5ED7",
    fontWeight: "bold"
  },
  emergencyText: {
    color: "#DC3545",
    fontWeight: "bold"
  },
  primary: {
    padding: 14,
    width: "100%",
    background: "#198754",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 16,
    cursor: "pointer"
  },
  link: {
    marginTop: 15,
    background: "none",
    border: "none",
    width: "100%",
    color: "#0B5ED7",
    cursor: "pointer"
  }
};
