import { useState } from "react";
const API = "http://127.0.0.1:5055/api";

export default function Patient({ logout }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ward, setWard] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [result, setResult] = useState(null);

  const book = async () => {
    if (phone.length !== 10) {
      alert("Phone number must be 10 digits");
      return;
    }

    const res = await fetch(`${API}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, ward, emergency })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    setResult(data);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: 30 }}>Patient Registration</h2>

        <div style={styles.row}>
          <input
            style={styles.input}
            placeholder="Full Name"
            onChange={e => setName(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Mobile Number"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
          />
        </div>

        <div style={styles.row}>
          <select
            style={styles.input}
            onChange={e => setWard(e.target.value)}
          >
            <option value="">Select Department</option>
            <option>Gynecologist</option>
            <option>Orthopedic</option>
            <option>Dermatology</option>
            <option>General</option>
          </select>

          <label style={styles.checkbox}>
            <input
              type="checkbox"
              style={styles.checkboxInput}
              onChange={e => setEmergency(e.target.checked)}
            />
            Emergency Case
          </label>
        </div>

        <button style={styles.primary} onClick={book}>
          Generate Token
        </button>

        {result && (
          <div style={styles.result}>
            <div>
              Token:{" "}
              <span style={styles.token}>
                {result.token}
              </span>
            </div>

            <div>
              Estimated Time:
              <b style={{ marginLeft: 6 }}>
                {result.estimatedTime}
              </b>
            </div>

            {emergency && (
              <div style={styles.emergencyText}>
                🔴 EMERGENCY CASE
              </div>
            )}
          </div>
        )}

        <button style={styles.link} onClick={logout}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F4F7FB",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px"
  },

  /* 🔹 WIDE CARD */
  card: {
    background: "#fff",
    padding: "40px 50px",
    width: "100%",
    maxWidth: 900, // ⬅️ MAKES SITE WIDE
    borderRadius: 18,
    boxShadow: "0 15px 35px rgba(0,0,0,0.12)"
  },

  /* 🔹 HORIZONTAL ROWS */
  row: {
    display: "flex",
    gap: 20,
    marginBottom: 20
  },

  input: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    border: "1px solid #CBD5E1",
    fontSize: 16
  },

  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: "bold",
    color: "#DC3545",
    whiteSpace: "nowrap"
  },

  checkboxInput: {
    accentColor: "#DC3545",
    width: 18,
    height: 18,
    cursor: "pointer"
  },

  primary: {
    width: "100%",
    padding: 16,
    background: "#0B5ED7",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 17,
    cursor: "pointer",
    marginTop: 10
  },

  result: {
    marginTop: 25,
    padding: 20,
    background: "#E7F1FF",
    borderRadius: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 15,
    fontSize: 16
  },

  token: {
    color: "#0B5ED7",
    fontWeight: "bold",
    fontSize: 24
  },

  emergencyText: {
    color: "#DC3545",
    fontWeight: "bold"
  },

  link: {
    marginTop: 25,
    background: "none",
    border: "none",
    color: "#0B5ED7",
    cursor: "pointer",
    fontSize: 15
  }
};

