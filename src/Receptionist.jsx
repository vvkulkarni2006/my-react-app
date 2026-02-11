import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5055";

export default function Receptionist() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [recentChecks, setRecentChecks] = useState([]);

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API}/api/reception-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) setIsLoggedIn(true);
      else alert(data.message);
    } catch (e) {
      alert("Backend not connected!");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0 
      });
      
      const onScanSuccess = async (decodedText) => {
        try {
          const res = await fetch(`${API}/api/checkin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qrData: decodedText })
          });
          const data = await res.json();
          
          if (res.ok) {
            setScanResult({ success: true, msg: data.message });
            setRecentChecks(prev => [{
                name: data.patient.name,
                token: data.patient.token,
                time: new Date().toLocaleTimeString()
            }, ...prev].slice(0, 5));
          } else {
            setScanResult({ success: false, msg: data.message });
          }
        } catch (e) {
          setScanResult({ success: false, msg: "Connection Error" });
        }
        setTimeout(() => setScanResult(null), 4000);
      };

      scanner.render(onScanSuccess, (err) => {});
      return () => scanner.clear();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div style={styles.loginOverlay}>
        <div style={styles.loginCard}>
          <div style={styles.iconCircle}>🏢</div>
          <h2 style={{margin: '10px 0'}}>Reception Desk</h2>
          <input style={styles.input} placeholder="Admin ID" onChange={e => setUsername(e.target.value)} />
          <input style={styles.input} type="password" placeholder="Passcode" onChange={e => setPassword(e.target.value)} />
          <button style={styles.loginBtn} onClick={handleLogin}>Unlock Scanner</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.scannerWrapper}>
        <div style={styles.header}>
          <button onClick={() => setIsLoggedIn(false)} style={styles.backBtn}>← Logout</button>
          <h3>QR Entrance Scanner</h3>
          <div style={styles.liveIndicator}>LIVE</div>
        </div>
        <div id="reader" style={styles.readerView}></div>
        {scanResult && (
          <div style={{...styles.alert, background: scanResult.success ? '#dcfce7' : '#fee2e2'}}>
            <span>{scanResult.success ? "✅" : "❌"}</span>
            <div>
              <b style={{color: scanResult.success ? '#166534' : '#991b1b'}}>{scanResult.success ? "VERIFIED" : "ERROR"}</b>
              <p style={{margin: 0, fontSize: '14px'}}>{scanResult.msg}</p>
            </div>
          </div>
        )}
        <div style={styles.historySection}>
          <h4 style={{marginBottom: '10px', borderBottom: '1px solid #eee'}}>Recent Check-ins</h4>
          {recentChecks.map((item, i) => (
            <div key={i} style={styles.historyItem}>
              <span><b>{item.token}</b> - {item.name}</span>
              <span style={{fontSize: '11px', color: '#94a3b8'}}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  loginOverlay: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f1f5f9' },
  loginCard: { background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', textAlign: 'center', width: '350px' },
  iconCircle: { width: '60px', height: '60px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', fontSize: '30px' },
  input: { width: '100%', padding: '14px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  loginBtn: { width: '100%', padding: '14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  container: { background: '#f8fafc', minHeight: '100vh', padding: '20px' },
  scannerWrapper: { maxWidth: '500px', margin: '0 auto', background: '#fff', padding: '20px', borderRadius: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  backBtn: { border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' },
  liveIndicator: { background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' },
  readerView: { borderRadius: '15px', overflow: 'hidden' },
  alert: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '12px', marginTop: '20px' },
  historySection: { marginTop: '30px' },
  historyItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f8fafc' },
};