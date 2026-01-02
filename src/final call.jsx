import { useState, useEffect } from "react";

const API = "http://127.0.0.1:5055/api";

const wards = ["Gynecologist", "Orthopedic", "Dermatology", "General"];

export default function App() {
  const [view, setView] = useState("login");
  const [ward, setWard] = useState("");
  const [queueData, setQueueData] = useState({});
  const [form, setForm] = useState({
    name: "",
    phone: "",
    emergency: false
  });

  useEffect(() => {
    if (view !== "login") {
      fetchQueue();
      const timer = setInterval(fetchQueue, 3000);
      return () => clearInterval(timer);
    }
  }, [view, ward]);

  const fetchQueue = async () => {
    const res = await fetch(`${API}/queue/${ward}`);
    const data = await res.json();
    setQueueData(data);
  };

  // -------- BOOK TOKEN --------
  const bookToken = async () => {
    if (!form.name || !form.phone || !ward) {
      alert("Please enter Name, Phone and select Ward");
      return;
    }

    try {
      const res = await fetch(`${API}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ward })
      });

      const data = await res.json();
      alert(`✅ Token Booked\nToken: ${data.token}\nWait: ${data.waitTime}`);
    } catch {
      alert("Server error");
    }
  };

  // -------- CALL NEXT --------
  const callNext = async () => {
    await fetch(`${API}/call-next/${ward}`, { method: "POST" });
    fetchQueue();
  };

  // -------- LOGIN PAGE --------
  if (view === "login") {
    return (
      <div style={{ padding: 20 }}>
        <h2>🏥 Hospital Queue System</h2>

        <h3>Patient Booking</h3>
        <input
          placeholder="Patient Name"
          onChange={e => setForm({ ...form, name: e.target.value })}
        /><br /><br />

        <input
          placeholder="Phone Number"
          onChange={e => setForm({ ...form, phone: e.target.value })}
        /><br /><br />

        <label>
          Emergency
          <input
            type="checkbox"
            onChange={e => setForm({ ...form, emergency: e.target.checked })}
          />
        </label><br /><br />

        <select value={ward} onChange={e => setWard(e.target.value)}>
          <option value="">-- Select Ward --</option>
          {wards.map(w => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select><br /><br />

        <button onClick={bookToken}>Book Token</button>

        <hr />

        <h3>Doctor / Ward Display</h3>
        {wards.map(w => (
          <button
            key={w}
            style={{ margin: 5 }}
            onClick={() => { setWard(w); setView("ward"); }}
          >
            {w}
          </button>
        ))}
      </div>
    );
  }

  // -------- WARD DISPLAY / DOCTOR VIEW --------
  return (
    <div style={{ padding: 20 }}>
      <h2>{ward} Ward</h2>

      <h3>
        Now Serving:
        <span style={{ color: "green" }}>
          {" "}{queueData.nowServing?.token || "None"}
        </span>
      </h3>

      <h4>Next Patients</h4>
      <ul>
        {queueData.queue?.slice(0, 5).map(p => (
          <li key={p.token} style={{ color: p.emergency ? "red" : "black" }}>
            {p.token} - {p.name}
          </li>
        ))}
      </ul>

      <button onClick={callNext}>Call Next Patient</button>
      <br /><br />
      <button onClick={() => setView("login")}>Back</button>
    </div>
  );
}