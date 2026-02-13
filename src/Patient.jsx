import React, { useState, useEffect, useCallback } from "react";
import jsPDF from "jspdf";

const API = "http://localhost:5055";

export default function Patient({ logout }) {
  const [view, setView] = useState("register");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [ward, setWard] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusResult, setStatusResult] = useState(null);

  const qrUrl = result 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ABH-${result.token}-${result.phone}` 
    : "";

  const speakStatus = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleCheckStatus = useCallback(async (isAuto = false) => {
    if (!phone || !ward) {
      if (!isAuto) alert("Please enter your Phone Number and select a Ward");
      return;
    }
    if (!isAuto) setLoading(true);
    try {
      const res = await fetch(`${API}/api/queues`);
      const allQueues = await res.json();
      const wardQueue = allQueues[ward] || [];
      const index = wardQueue.findIndex(p => String(p.phone).trim() === String(phone).trim());

      setTimeout(() => {
          if (index !== -1) {
            setStatusResult({
              position: index + 1,
              estimatedTime: (index + 1) * 10,
              name: wardQueue[index].name,
              lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });
          } else {
            if (!isAuto) alert(`No active booking found for ${phone} in ${ward}.`);
            if (isAuto) setStatusResult(null);
          }
          setLoading(false);
      }, 1200);
    } catch (err) {
      console.error("Status fetch error:", err);
      setLoading(false);
    }
  }, [phone, ward]);

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
      
      setTimeout(() => {
          setResult(data);
          speakStatus(`Registration completed. Please wait ${data.name}. Scan the Q R code at the receptionist desk.`);
          setLoading(false);
      }, 1500);

    } catch (err) { 
      alert("Error: " + err.message); 
      setLoading(false);
    }
  };

  const sendWhatsApp = () => {
    if (!result) return;
    const messageBody = `*AYUSHMAN BHARAT HOSPITAL*\n*Token:* ${result.token}\n*Patient:* ${result.name.toUpperCase()}\n*Dept:* ${result.ward}\n*Time:* ${result.estimatedTime}\n*QR:* ${qrUrl}`;
    window.open(`https://wa.me/91${result.phone}?text=${encodeURIComponent(messageBody)}`, "_blank");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const qrImg = document.getElementById("qrCodeImage");
    const date = new Date().toLocaleDateString();

    // --- 1. Header & Branding ---
    doc.setFillColor(11, 94, 215); // Medical Blue
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("AYUSHMAN BHARAT HOSPITAL", 20, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("24/7 Digital Healthcare Services | Electronic Prescription", 20, 28);

    // --- 2. Patient Info Section ---
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PATIENT INFORMATION", 20, 52);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 54, 100, 54);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Patient Name: ${result.name.toUpperCase()}`, 20, 62);
    doc.text(`Phone Number: +91 ${result.phone}`, 20, 70);
    doc.text(`Department:   ${result.ward}`, 20, 78);
    doc.text(`Token Number: #${result.token}`, 20, 86);
    doc.text(`Date:         ${date}`, 150, 52);

    // --- 3. QR Code Placement ---
    if (qrImg) {
      const canvas = document.createElement("canvas");
      canvas.width = qrImg.width; canvas.height = qrImg.height;
      canvas.getContext("2d").drawImage(qrImg, 0, 0);
      doc.addImage(canvas.toDataURL("image/png"), 'PNG', 150, 58, 35, 35);
      doc.setFontSize(7);
      doc.text("SCAN AT RECEPTION", 154, 96);
    }

    // --- 4. Prescription Table (The RX Section) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(11, 94, 215);
    doc.text("Rx", 20, 110);
    
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(245, 247, 250);
    doc.rect(20, 115, 170, 10, 'F'); // Table Header Background
    
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text("Medicine Name", 25, 121);
    doc.text("Morning", 95, 121);
    doc.text("Afternoon", 125, 121);
    doc.text("Night", 160, 121);

    // Draw Dosage Table Rows
    let yPos = 125;
    for (let i = 0; i < 6; i++) {
        doc.rect(20, yPos, 170, 12); // Row outline
        doc.line(90, yPos, 90, yPos + 12); // Vertical dividers
        doc.line(120, yPos, 120, yPos + 12);
        doc.line(155, yPos, 155, yPos + 12);
        yPos += 12;
    }

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("* Doctor's Note: Tick the columns to indicate dosage timing.", 20, yPos + 8);

    // --- 5. Professional Green Digital Seal ---
    doc.setDrawColor(21, 128, 61); // Green
    doc.setLineWidth(1);
    doc.circle(165, 240, 22); // Draw Seal Circle
    
    doc.setTextColor(21, 128, 61);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("DIGITALLY SIGNED", 149, 236);
    doc.text(result.ward.toUpperCase(), 152, 241);
    doc.text("DEPT. VERIFIED", 152, 246);
    
    // Bottom Signature Line
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.text("__________________________", 20, 255);
    doc.text("Authorized Doctor Signature", 20, 262);

    doc.save(`Prescription_Token_${result.token}.pdf`);
  };

  return (
    <div style={styles.loginOverlay}>
      {/* --- LEFT PANEL: SMART CARE GUIDE --- */}
      <div style={styles.leftPanel}>
        <div style={styles.brandBadge}>AYUSHMAN CARE PORTAL</div>
        <h1 style={styles.panelTitle}>Your Health, <br/><span style={{color: '#0b5ed7'}}>Our Priority.</span></h1>
        <p style={styles.panelSubtitle}>Skip the long queues. Register in seconds and track your turn in real-time.</p>
        
        <div style={styles.statGrid}>
          <div style={styles.miniCard}>
            <span style={styles.statEmoji}>⚡</span>
            <div>
              <small style={styles.statLabel}>AVG REG TIME</small>
              <p style={styles.statVal}>45 Sec</p>
            </div>
          </div>
          <div style={styles.miniCard}>
            <span style={styles.statEmoji}>📱</span>
            <div>
              <small style={styles.statLabel}>MOBILE QR</small>
              <p style={styles.statVal}>Eco-Friendly</p>
            </div>
          </div>
        </div>
        
        <div style={styles.guideBox}>
            <p><strong>Quick Guide:</strong></p>
            <p>1. Register your details<br/>2. Save your Token QR<br/>3. Verify at Reception desk</p>
        </div>
      </div>

      {/* --- RIGHT PANEL: ACTION DASHBOARD --- */}
      <div style={styles.loginCard}>
        {loading ? (
          <div style={styles.loaderContainer}>
            <svg width="150" height="50" viewBox="0 0 150 50">
              <path
                d="M0,25 L30,25 L35,10 L45,40 L50,25 L150,25"
                fill="none"
                stroke="#0b5ed7"
                strokeWidth="3"
                strokeLinecap="round"
                style={styles.heartbeatPath}
              />
            </svg>
            <p style={styles.loaderText}>CONNECTING TO SERVER...</p>
          </div>
        ) : (
          <>
            <div style={styles.tabBar}>
                <button 
                style={{...styles.tab, borderBottom: view === "register" ? "3px solid #0b5ed7" : "none", color: view === "register" ? "#0b5ed7" : "#64748b"}} 
                onClick={() => {setView("register"); setResult(null); setStatusResult(null);}}
                >Registration</button>
                <button 
                style={{...styles.tab, borderBottom: view === "status" ? "3px solid #0b5ed7" : "none", color: view === "status" ? "#0b5ed7" : "#64748b"}} 
                onClick={() => {setView("status"); setResult(null); setStatusResult(null);}}
                >Track Status</button>
            </div>

            {!result && !statusResult ? (
              <div style={styles.formContent}>
                <h3 style={{color: '#1e293b', marginBottom: '20px', textAlign: 'left'}}>
                    {view === "register" ? "Patient Registration" : "Check Queue Status"}
                </h3>
                <div style={styles.inputGroup}>
                  {view === "register" && <input style={styles.input} placeholder="Patient Full Name" value={name} onChange={e => setName(e.target.value)} />}
                  <input style={styles.input} type="tel" placeholder="Mobile Number" maxLength={10} value={phone} onChange={e => setPhone(e.target.value)} />
                  <select style={styles.select} value={ward} onChange={e => setWard(e.target.value)}>
                    <option value="">Select Ward</option>
                    <option>Gynecologist</option><option>Orthopedic</option><option>Dermatology</option><option>General</option>
                  </select>
                  {view === "register" && (
                    <label style={styles.checkboxLabel}>
                        <input type="checkbox" checked={emergency} onChange={e => setEmergency(e.target.checked)} />
                        <span style={{ color: emergency ? '#dc3545' : '#64748b', fontWeight: emergency ? 'bold' : 'normal' }}>Mark as Emergency</span>
                    </label>
                  )}
                  <button style={styles.bookBtn} onClick={view === "register" ? book : () => handleCheckStatus(false)}>
                    {view === "register" ? "Generate Token" : "Get Status"}
                  </button>
                </div>
              </div>
            ) : result ? (
              <div style={styles.resultView}>
                <div style={styles.successHeader}>
                  <h3 style={{margin: '0', color: '#15803d'}}>Registration Success</h3>
                </div>

                <div style={styles.tokenCircle}><small>TOKEN</small><h1>{result.token}</h1></div>
                <div style={styles.qrBox}><img id="qrCodeImage" src={qrUrl} alt="QR" crossOrigin="anonymous" style={{width:'130px'}} /></div>
                
                <div style={styles.actionGrid}>
                    <button style={styles.whatsappBtn} onClick={sendWhatsApp}>WhatsApp QR</button>
                    <button style={styles.pdfBtn} onClick={downloadPDF}>Download PDF</button>
                </div>
                <button style={styles.resetBtn} onClick={() => setResult(null)}>New Registration</button>
              </div>
            ) : (
              <div style={styles.statusView}>
                <div style={styles.statusHeader}>
                    <span style={styles.posLabel}>QUEUE POSITION</span>
                    <h1 style={styles.posValue}>#{statusResult.position}</h1>
                </div>
                <div style={styles.waitBox}>
                  <p style={{margin: '0 0 5px 0', fontSize: '12px', color: '#64748b'}}>Est. Wait Time</p>
                  <h2 style={{margin: 0, color: '#0b5ed7'}}>{statusResult.estimatedTime} Minutes</h2>
                </div>
                <p style={{textAlign:'center', color:'#94a3b8', fontSize:'12px', marginTop:'15px'}}>
                  Patient: <b>{statusResult.name}</b><br/>
                  Synced: {statusResult.lastUpdated}
                </p>
                <button style={{...styles.bookBtn, marginTop:'15px'}} onClick={() => handleCheckStatus(false)}>🔄 Sync Refresh</button>
                <button style={{...styles.resetBtn, marginTop:'10px'}} onClick={() => setStatusResult(null)}>Go Back</button>
              </div>
            )}
            <button style={styles.logoutBtn} onClick={logout}>← Back to Home</button>
          </>
        )}
      </div>
      <style>{`
        @keyframes drawHeartbeat {
          0% { stroke-dashoffset: 600; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  loginOverlay: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', fontFamily: 'sans-serif', gap: '60px' },
  leftPanel: { maxWidth: '420px', textAlign: 'left' },
  brandBadge: { background: '#e0f2fe', color: '#0369a1', padding: '5px 12px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', display: 'inline-block', marginBottom: '15px' },
  panelTitle: { fontSize: '2.8rem', fontWeight: '900', color: '#0f172a', margin: '0', lineHeight: '1.1' },
  panelSubtitle: { fontSize: '1.1rem', color: '#64748b', marginBottom: '35px', marginTop: '15px' },
  statGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  miniCard: { background: '#fff', padding: '15px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
  statEmoji: { fontSize: '20px' },
  statLabel: { color: '#94a3b8', fontWeight: '800', fontSize: '9px' },
  statVal: { color: '#1e293b', fontWeight: '800', margin: 0 },
  guideBox: { marginTop: '30px', padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.5)', fontSize: '13px', color: '#475569', borderLeft: '4px solid #0b5ed7' },

  loginCard: { background: '#fff', padding: '40px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', width: '400px', minHeight: '500px', display: 'flex', flexDirection: 'column' },
  tabBar: { display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #e2e8f0' },
  tab: { flex: 1, padding: '12px', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', fontSize: '14px' },
  
  formContent: { textAlign: 'left' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '15px', background: '#f8fafc', outline: 'none' },
  select: { padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '15px', background: '#f8fafc', outline: 'none' },
  checkboxLabel: { display:'flex', alignItems:'center', gap: '8px', fontSize: '13px', padding: '5px' },
  bookBtn: { background: '#0b5ed7', color: '#fff', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '15px', marginTop: '10px' },
  
  resultView: { textAlign: 'center' },
  successHeader: { background: '#f0fdf4', padding: '10px', borderRadius: '10px', marginBottom: '20px' },
  tokenCircle: { background: '#fff', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', border: '2px solid #0b5ed7', boxShadow: '0 4px 10px rgba(11, 94, 215, 0.2)' },
  qrBox: { textAlign: 'center', background: '#f8fafc', padding: '15px', borderRadius: '20px', border: '1px dashed #cbd5e1', marginBottom: '20px' },
  actionGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' },
  whatsappBtn: { background: '#25D366', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  pdfBtn: { background: '#1e293b', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  resetBtn: { background: 'transparent', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px', color: '#64748b', cursor: 'pointer', width: '100%', fontSize: '13px' },
  
  statusView: { textAlign: 'center' },
  statusHeader: { marginBottom: '20px' },
  posLabel: { fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '1px' },
  posValue: { fontSize: '56px', color: '#0b5ed7', margin: '0' },
  waitBox: { background: '#f1f5f9', padding: '15px', borderRadius: '20px' },
  
  logoutBtn: { marginTop: 'auto', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '12px', paddingTop: '20px' },
  
  loaderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' },
  heartbeatPath: { strokeDasharray: 600, strokeDashoffset: 600, animation: 'drawHeartbeat 1.5s linear infinite' },
  loaderText: { marginTop: '20px', color: '#0b5ed7', fontWeight: '800', fontSize: '11px', letterSpacing: '2px' }
};