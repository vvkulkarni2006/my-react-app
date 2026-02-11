import React, { useState } from "react";
import jsPDF from "jspdf";

const API = "http://127.0.0.1:5055/api";

export default function Patient({ logout }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ward, setWard] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Using a more reliable QR API for PDF generation
  const qrUrl = result ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ABH-${result.token}-${phone}` : "";

  const book = async () => {
    if (!name || !phone || !ward) return alert("Please fill all fields");
    setLoading(true);
    try {
      const res = await fetch(`${API}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, ward, emergency })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data);
    } catch (err) { alert(err.message); } 
    finally { setLoading(false); }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const qrImg = document.getElementById("qrCodeImage");

    // Header Design
    doc.setFillColor(11, 94, 215);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255);
    doc.setFontSize(22);
    doc.text("AYUSHMAN BHARAT HOSPITAL", 20, 25);
    
    // Body Text
    doc.setTextColor(40);
    doc.setFontSize(14);
    doc.text(`PATIENT SLIP (Token: ${result.token})`, 20, 55);
    doc.line(20, 58, 100, 58);

    doc.setFontSize(12);
    doc.text(`Name: ${name.toUpperCase()}`, 20, 70);
    doc.text(`Mobile: +91 ${phone}`, 20, 80);
    doc.text(`Department: ${ward}`, 20, 90);
    doc.setFont("helvetica", "bold");
    doc.text(`Estimated Time: ${result.estimatedTime}`, 20, 105);

    // QR Code Integration (Wait for image to be rendered in DOM)
    if (qrImg) {
        // We use a canvas-based approach to ensure CORS doesn't block the PDF save
        const canvas = document.createElement("canvas");
        canvas.width = qrImg.width;
        canvas.height = qrImg.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(qrImg, 0, 0);
        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, 'PNG', 140, 50, 50, 50);
    }

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Scan this QR at the Reception for Entry", 140, 105);

    doc.save(`${name}_Token_${result.token}.pdf`);
  };

  const sendWhatsApp = () => {
    const msg = `*AYUSHMAN BHARAT HOSPITAL*%0A----------------------------%0A*Token:* ${result.token}%0A*Patient:* ${name}%0A*Ward:* ${ward}%0A*Time:* ${result.estimatedTime}%0A----------------------------%0A_Please show your QR Code at the entrance._`;
    window.open(`https://api.whatsapp.com/send?phone=91${phone}&text=${msg}`, "_blank");
  };

  return (
    <div style={styles.container}>
      {!result ? (
        <div style={styles.card}>
          <h2 style={{textAlign: 'center', color: '#1e293b'}}>OPD Registration</h2>
          <div style={styles.inputGroup}>
            <input style={styles.input} placeholder="Patient Full Name" onChange={e => setName(e.target.value)} />
            <input style={styles.input} placeholder="Mobile Number" maxLength={10} onChange={e => setPhone(e.target.value)} />
            <select style={styles.select} onChange={e => setWard(e.target.value)}>
              <option value="">Select Department</option>
              <option>Gynecologist</option>
              <option>Orthopedic</option>
              <option>Dermatology</option>
              <option>General</option>
            </select>
            <label style={{display:'flex', alignItems:'center', gap: '10px', cursor:'pointer'}}>
                <input type="checkbox" onChange={e => setEmergency(e.target.checked)} />
                <span style={{color: emergency ? 'red' : '#64748b', fontWeight: 'bold'}}>Emergency Case</span>
            </label>
            <button style={styles.bookBtn} onClick={book} disabled={loading}>
                {loading ? "Processing..." : "Get Digital Token"}
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.card}>
          <div style={styles.successHeader}>
            <div style={styles.tokenCircle}>
              <small>TOKEN</small>
              <h1>{result.token}</h1>
            </div>
            <h3>Booking Confirmed!</h3>
          </div>

          <div style={styles.qrBox}>
            <img 
              id="qrCodeImage"
              src={qrUrl} 
              alt="QR Code" 
              crossOrigin="anonymous" 
              style={{width: '150px', height: '150px'}}
            />
          </div>

          <div style={styles.infoRow}>
            <p><b>Position:</b> {result.position}</p>
            <p><b>Slot:</b> {result.estimatedTime}</p>
          </div>

          <div style={styles.buttonStack}>
            <button style={styles.pdfBtn} onClick={downloadPDF}>📥 Download Appointment Slip</button>
            <button style={styles.waBtn} onClick={sendWhatsApp}>💬 Send to WhatsApp</button>
            <button style={styles.resetBtn} onClick={() => setResult(null)}>Back to New Booking</button>
          </div>
        </div>
      )}
      <button style={styles.logoutBtn} onClick={logout}>← Back to Main Menu</button>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  card: { background: '#fff', padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' },
  select: { padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' },
  bookBtn: { background: '#0b5ed7', color: '#fff', border: 'none', padding: '15px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  successHeader: { textAlign: 'center', marginBottom: '20px' },
  tokenCircle: { background: '#f0f7ff', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', border: '2px solid #0b5ed7' },
  qrBox: { textAlign: 'center', background: '#f8fafc', padding: '20px', borderRadius: '15px', marginBottom: '20px' },
  infoRow: { display: 'flex', justifyContent: 'space-around', marginBottom: '20px', fontSize: '14px' },
  buttonStack: { display: 'flex', flexDirection: 'column', gap: '10px' },
  pdfBtn: { background: '#1e293b', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer' },
  waBtn: { background: '#25D366', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer' },
  resetBtn: { background: 'none', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px', cursor: 'pointer' },
  logoutBtn: { marginTop: '20px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }
};