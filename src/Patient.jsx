import React, { useState } from "react";
import jsPDF from "jspdf";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5055";

export default function Patient({ logout }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ward, setWard] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const qrUrl = result ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ABH-${result.token}-${phone}` : "";

  const book = async () => {
    if (!name || !phone || !ward) return alert("Please fill all fields");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, ward, emergency })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Server Error");
      setResult(data);
    } catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const qrImg = document.getElementById("qrCodeImage");
    doc.setFillColor(11, 94, 215);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("AYUSHMAN BHARAT HOSPITAL", 20, 25);
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(16);
    doc.text(`PATIENT SLIP`, 20, 55);
    doc.setFontSize(12);
    doc.text(`Token Number: ${result.token}`, 20, 63);
    doc.text(`Patient Name: ${name.toUpperCase()}`, 20, 80);
    doc.text(`Department: ${ward}`, 20, 90);
    doc.setFont("helvetica", "bold");
    doc.text(`Estimated Time: ${result.estimatedTime}`, 20, 105);
    if (qrImg) {
      const canvas = document.createElement("canvas");
      canvas.width = qrImg.width; canvas.height = qrImg.height;
      canvas.getContext("2d").drawImage(qrImg, 0, 0);
      doc.addImage(canvas.toDataURL("image/png"), 'PNG', 140, 50, 50, 50);
    }
    doc.save(`${name}_Token.pdf`);
  };

  return (
    <div style={styles.container}>
      {!result ? (
        <div style={styles.card}>
          <h2 style={{textAlign: 'center', color: '#1e293b', marginBottom: '20px'}}>OPD Registration</h2>
          <div style={styles.inputGroup}>
            <input style={styles.input} placeholder="Patient Full Name" onChange={e => setName(e.target.value)} />
            <input style={styles.input} type="tel" placeholder="Mobile Number" maxLength={10} onChange={e => setPhone(e.target.value)} />
            <select style={styles.select} onChange={e => setWard(e.target.value)}>
              <option value="">Select Department</option>
              <option>Gynecologist</option><option>Orthopedic</option>
              <option>Dermatology</option><option>General</option>
            </select>
            <label style={styles.checkboxLabel}>
                <input type="checkbox" onChange={e => setEmergency(e.target.checked)} />
                <span style={{color: emergency ? '#dc3545' : '#64748b', fontWeight: 'bold'}}>Emergency Case</span>
            </label>
            <button style={styles.bookBtn} onClick={book} disabled={loading}>{loading ? "Generating..." : "Get Digital Token"}</button>
          </div>
        </div>
      ) : (
        <div style={styles.card}>
          <div style={styles.tokenCircle}>
            <small>TOKEN</small><h1>{result.token}</h1>
          </div>
          <div style={styles.qrBox}>
            <img id="qrCodeImage" src={qrUrl} alt="QR" crossOrigin="anonymous" style={{width: '160px'}} />
          </div>
          <div style={styles.infoRow}>
            <div><small>Position</small><p><b>{result.position}</b></p></div>
            <div><small>Slot</small><p><b>{result.estimatedTime}</b></p></div>
          </div>
          <button style={styles.pdfBtn} onClick={downloadPDF}>📥 Download PDF Slip</button>
          <button style={styles.resetBtn} onClick={() => setResult(null)}>New Registration</button>
        </div>
      )}
      <button style={styles.logoutBtn} onClick={logout}>← Back</button>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', padding: '20px' },
  card: { background: '#ffffff', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '16px' },
  select: { padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '16px', background: 'white' },
  checkboxLabel: { display:'flex', alignItems:'center', gap: '10px', cursor:'pointer' },
  bookBtn: { background: '#0b5ed7', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  tokenCircle: { background: '#f0f7ff', width: '90px', height: '90px', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', border: '3px solid #0b5ed7' },
  qrBox: { textAlign: 'center', background: '#f1f5f9', padding: '20px', borderRadius: '20px', marginBottom: '20px' },
  infoRow: { display: 'flex', justifyContent: 'space-around', marginBottom: '25px', textAlign: 'center' },
  pdfBtn: { background: '#1e293b', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', cursor: 'pointer', width: '100%', marginBottom: '10px' },
  resetBtn: { background: 'transparent', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px', color: '#64748b', cursor: 'pointer', width: '100%' },
  logoutBtn: { marginTop: '25px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }
};