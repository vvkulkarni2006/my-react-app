import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const API = "http://localhost:5055";
const successSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
const errorSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3");

export default function Receptionist({ logout }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [recentChecks, setRecentChecks] = useState([]);
  const [manualToken, setManualToken] = useState("");
  
  const [temp, setTemp] = useState("");
  const [bp, setBp] = useState("");
  
  const isProcessing = useRef(false);

  const handleLogin = async () => {
    if (!username || !password) return alert("Please enter credentials");
    setIsLoading(true); 

    try {
      const res = await fetch(`${API}/api/reception-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      setTimeout(() => { 
        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          alert(data.message);
        }
        setIsLoading(false);
      }, 1500);

    } catch (e) {
      setIsLoading(false);
      alert("Local backend not connected!");
    }
  };

  const handleScan = (dataString) => {
    let cleanToken = dataString.includes("-") ? dataString.split("-")[1] : dataString.trim().toUpperCase();
    setManualToken(cleanToken);
    const readerEl = document.getElementById("reader");
    if(readerEl) {
        readerEl.style.border = "5px solid #22c55e";
        setTimeout(() => readerEl.style.border = "2px solid #f1f5f9", 500);
    }
  };

  const processCheckin = async () => {
    if (!manualToken) return alert("Please scan QR or enter Token first");
    if (isProcessing.current) return;
    isProcessing.current = true;

    try {
      const res = await fetch(`${API}/api/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          qrData: manualToken,
          vitals: { temp: temp || "N/A", bp: bp || "N/A" } 
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        successSound.play().catch(e => {});
        setScanResult({ success: true, msg: data.message });
        setRecentChecks(prev => [{
            name: data.patient.name,
            token: data.patient.token,
            temp: temp || "N/A",
            bp: bp || "N/A",
            time: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 5));
        
        setManualToken(""); 
        setTemp(""); 
        setBp("");   
      } else {
        errorSound.play().catch(e => {});
        setScanResult({ success: false, msg: data.message });
      }
    } catch (e) {
      setScanResult({ success: false, msg: "Server Error" });
    }

    setTimeout(() => {
      setScanResult(null);
      isProcessing.current = false;
    }, 3000);
  };

  useEffect(() => {
    let scanner = null;
    if (isLoggedIn) {
      const timer = setTimeout(() => {
        scanner = new Html5QrcodeScanner("reader", { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [0] 
        });
        scanner.render((text) => handleScan(text), (err) => {});
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scanner) scanner.clear().catch(e => {});
      };
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div style={styles.loginOverlay}>
        {/* --- LEFT PANEL: OPERATIONAL PULSE --- */}
        <div style={styles.leftPanel}>
          <div style={styles.brandBadge}>SMART OPD SYSTEM</div>
          <h1 style={styles.panelTitle}>Ayushman <span style={{color: '#3b82f6'}}>Bharat</span></h1>
          <p style={styles.panelSubtitle}>Receptionist Command Center</p>
          
          <div style={styles.statGrid}>
            <div style={styles.miniCard}>
              <span style={styles.statEmoji}>⏱️</span>
              <div>
                <small style={styles.statLabel}>AVG WAIT</small>
                <p style={styles.statVal}>14 Mins</p>
              </div>
            </div>
            <div style={styles.miniCard}>
              <span style={styles.statEmoji}>🩺</span>
              <div>
                <small style={styles.statLabel}>DOCS LIVE</small>
                <p style={styles.statVal}>12 Online</p>
              </div>
            </div>
          </div>
          
          <div style={styles.securityText}>
            🔐 Secure Session | End-to-End Encrypted
          </div>
        </div>

        {/* --- RIGHT PANEL: LOGIN CARD --- */}
        <div style={styles.loginCard}>
          {isLoading ? (
            <div style={styles.loaderContainer}>
              <svg width="150" height="50" viewBox="0 0 150 50">
                <path
                  d="M0,25 L30,25 L35,10 L45,40 L50,25 L150,25"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={styles.heartbeatPath}
                />
              </svg>
              <p style={styles.loaderText}>VERIFYING ACCESS...</p>
            </div>
          ) : (
            <>
              <div style={styles.loginHeader}>
                <h2 style={{margin: '0 0 5px 0', color: '#1e293b'}}>Staff Login</h2>
                <p style={{fontSize: '13px', color: '#64748b', margin: 0}}>Enter credentials to unlock terminal</p>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>ADMINISTRATION ID</label>
                <input style={styles.input} placeholder="e.g. REC-102" onChange={e => setUsername(e.target.value)} />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>SECURITY PASSCODE</label>
                <input style={styles.input} type="password" placeholder="••••••••" onChange={e => setPassword(e.target.value)} />
              </div>

              <button style={styles.loginBtn} onClick={handleLogin}>Authorize & Start Shift</button>
              <button style={styles.homeBtn} onClick={logout}>← Back to Home</button>
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

  return (
    <div style={styles.container}>
      <div style={styles.scannerWrapper}>
        <div style={styles.header}>
          <button onClick={() => setIsLoggedIn(false)} style={styles.backBtn}>← Logout</button>
          <h3 style={{margin: 0}}>Reception Check-in</h3>
          <div style={styles.liveIndicator}>LIVE</div>
        </div>

        <div id="reader" style={styles.readerView}></div>

        <div style={styles.manualEntryBox}>
          <p style={styles.stepTitle}>STEP 1: Scan QR or Enter Token</p>
          <input 
            style={{...styles.input, marginBottom: '15px', border: manualToken ? '2px solid #3b82f6' : '1px solid #e2e8f0'}} 
            placeholder="Token (e.g. G101)" 
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value.toUpperCase())}
          />

          <p style={styles.stepTitle}>STEP 2: Enter Patient Vitals</p>
          <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
            <input style={{...styles.input, marginBottom: 0, flex: 1}} placeholder="Temp (°F)" value={temp} type="number" onChange={(e) => setTemp(e.target.value)} />
            <input style={{...styles.input, marginBottom: 0, flex: 1}} placeholder="BP (120/80)" value={bp} onChange={(e) => setBp(e.target.value)} />
          </div>

          <button 
            style={{...styles.verifyBtn, background: manualToken ? '#059669' : '#94a3b8'}} 
            onClick={processCheckin}
            disabled={!manualToken}
          >
            CONFIRM CHECK-IN
          </button>
        </div>

        {scanResult && (
          <div style={{...styles.alert, background: scanResult.success ? '#dcfce7' : '#fee2e2'}}>
            <span style={{fontSize: '24px'}}>{scanResult.success ? "✅" : "❌"}</span>
            <div>
              <b style={{color: scanResult.success ? '#166534' : '#991b1b', display: 'block'}}>{scanResult.success ? "SUCCESS" : "ERROR"}</b>
              <p style={{margin: 0, fontSize: '14px', color: scanResult.success ? '#166534' : '#991b1b'}}>{scanResult.msg}</p>
            </div>
          </div>
        )}

        <div style={styles.historySection}>
          <h4 style={{marginBottom: '10px', borderBottom: '1px solid #eee'}}>Last 5 Check-ins</h4>
          {recentChecks.map((item, i) => (
            <div key={i} style={styles.historyItem}>
              <div>
                <b>{item.token}</b> - {item.name}
                <div style={{fontSize: '11px', color: '#64748b'}}>{item.temp}°F | BP: {item.bp}</div>
              </div>
              <span style={{fontSize: '11px', color: '#94a3b8'}}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  // Login Page Styles
  loginOverlay: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', fontFamily: 'Inter, sans-serif', gap: '60px' },
  leftPanel: { maxWidth: '400px', textAlign: 'left' },
  brandBadge: { background: '#e0f2fe', color: '#0369a1', padding: '5px 12px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', display: 'inline-block', marginBottom: '15px' },
  panelTitle: { fontSize: '3rem', fontWeight: '900', color: '#0f172a', margin: '0' },
  panelSubtitle: { fontSize: '1.1rem', color: '#64748b', marginBottom: '40px' },
  statGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  miniCard: { background: '#fff', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.03)' },
  statEmoji: { fontSize: '24px' },
  statLabel: { color: '#94a3b8', fontWeight: '700', fontSize: '9px' },
  statVal: { color: '#1e293b', fontWeight: '800', margin: 0 },
  securityText: { marginTop: '40px', fontSize: '12px', color: '#94a3b8', fontWeight: '600' },

  loginCard: { background: '#fff', padding: '50px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', width: '400px', textAlign: 'center' },
  loginHeader: { marginBottom: '30px', textAlign: 'left' },
  inputGroup: { marginBottom: '20px', textAlign: 'left' },
  label: { display: 'block', fontSize: '10px', fontWeight: '800', color: '#3b82f6', marginBottom: '6px' },
  input: { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', boxSizing: 'border-box', outline: 'none', background: '#f8fafc' },
  loginBtn: { width: '100%', padding: '16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', marginBottom: '15px', fontSize: '14px' },
  homeBtn: { width: '100%', background: 'none', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '14px', color: '#64748b', cursor: 'pointer', fontSize: '13px' },

  // Heartbeat Loader
  loaderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '200px', justifyContent: 'center' },
  heartbeatPath: { strokeDasharray: 600, strokeDashoffset: 600, animation: 'drawHeartbeat 1.5s linear infinite' },
  loaderText: { marginTop: '20px', color: '#3b82f6', fontWeight: '800', fontSize: '12px', letterSpacing: '2px' },

  // Dashboard Styles
  container: { background: '#f8fafc', minHeight: '100vh', padding: '20px' },
  scannerWrapper: { maxWidth: '500px', margin: '0 auto', background: '#fff', padding: '25px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  backBtn: { border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 'bold' },
  liveIndicator: { background: '#ef4444', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '900' },
  readerView: { borderRadius: '20px', overflow: 'hidden', border: '3px solid #f1f5f9' },
  manualEntryBox: { marginTop: '25px', padding: '20px', background: '#f8fafc', borderRadius: '18px' },
  stepTitle: { fontSize: '11px', color: '#1e293b', fontWeight: '900', marginBottom: '12px', textAlign: 'left', textTransform: 'uppercase' },
  verifyBtn: { color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', width: '100%', padding: '18px' },
  alert: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '15px', marginTop: '20px' },
  historySection: { marginTop: '25px', textAlign: 'left' },
  historyItem: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9', alignItems: 'center' },
};