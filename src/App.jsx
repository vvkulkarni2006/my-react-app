import React, { useState, useEffect } from "react";
import Patient from "./Patient";
import Doctor from "./Doctor";
import WardDisplay from "./WardDisplay";
import Receptionist from "./Receptionist";

const API = "http://localhost:5055";

// Static Data for the New Sections
const healthArticles = [
  { id: 1, title: "Mental Health in the Digital Age", category: "WELLNESS", read: "5 min", icon: "🧠" },
  { id: 2, title: "Decoding Ayushman Bharat Benefits", category: "GOVT SCHEMES", read: "8 min", icon: "🇮🇳" },
  { id: 3, title: "Post-Pandemic Respiratory Care", category: "MEDICAL", read: "6 min", icon: "🫁" }
];

export default function App() {
  const [page, setPage] = useState("terms"); 
  const [agreed, setAgreed] = useState(false);
  const [totalServed, setTotalServed] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null); // State for FAQ toggle
  
  const healthTips = [
    "💧 Stay Hydrated: Drink at least 8-10 glasses of water daily.",
    "🍎 Prevention is better than cure: Schedule your annual full-body checkup.",
    "🚶‍♂️ Walk for 30 minutes every morning to reduce heart disease risks.",
    "🛡️ New Vaccination Drive: Free Flu shots available in Ward 102.",
    "🩺 Monitor your BP regularly to prevent silent heart complications."
  ];
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % healthTips.length);
    }, 5000);
    return () => clearInterval(tipInterval);
  }, [healthTips.length]);

  const SUPPORT_PHONE = "9845927938"; 
  const SUPPORT_EMAIL = "24u0714@students.git.edu";

  const contactWhatsApp = () => {
    const message = encodeURIComponent("Hello, I need support with the Ayushman Bharat Smart OPD System.");
    window.open(`https://wa.me/91${SUPPORT_PHONE}?text=${message}`, "_blank");
  };

  useEffect(() => {
    const checkStatus = () => {
      const hour = new Date().getHours();
      setIsOpen(hour >= 9 && hour < 21);
    };
    checkStatus();
    const timer = setInterval(checkStatus, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/api/stats`);
        if (res.ok) {
          const data = await res.json();
          setTotalServed(data.totalServed || 0);
        }
      } catch (e) { console.error("Backend offline"); }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.appWrapper}>
      <div style={styles.overlay}></div>
      <div style={styles.contentContainer}>
        
        {page === "terms" && (
          <div style={styles.heroSection}>
            <div style={styles.glassCard}>
              <div style={styles.badge}>Compliance & Policy Portal</div>
              <h1 style={styles.mainTitle}>Hospital <span style={styles.highlight}>Agreement</span></h1>
              
              <div style={styles.awardsContainer}>
                <h3 style={styles.subHeading}>🏅 Our Excellence Standards</h3>
                <div style={styles.awardsGrid}>
                  <div style={styles.awardItem}>🏆 National Digital Health Award 2025</div>
                  <div style={styles.awardItem}>⭐ Certified for Electronic Health Records (EHR)</div>
                  <div style={styles.awardItem}>📜 ISO 27001 Data Security Standards</div>
                </div>
              </div>

              <div style={styles.termsBox}>
                <h4 style={{margin: '0 0 10px 0', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '5px'}}>Detailed Terms & Conditions</h4>
                <div style={styles.termsContent}>
                  <p><strong>1. Data Privacy & Security:</strong> By using this portal, you consent to the digital storage of your medical history, vitals, and personal ID under the Ayushman Bharat Digital Mission (ABDM) framework. We employ 256-bit encryption for all records.</p>
                  <p><strong>2. Emergency Protocol:</strong> This OPD system is for <strong>non-emergency</strong> consultations only. If you are experiencing chest pain, severe bleeding, or difficulty breathing, please bypass the queue and proceed directly to the 24/7 Casualty/ER ward.</p>
                  <p><strong>3. Accurate Information:</strong> You agree that all information provided during registration (Age, Contact, Medical History) is accurate. Misrepresentation may lead to incorrect diagnosis or cancellation of the token.</p>
                  <p><strong>4. Queue Integrity:</strong> Tokens are generated sequentially. However, the hospital reserves the right to prioritize "Triage Level 1" patients (critically ill) over general OPD tokens regardless of sequence.</p>
                  <p><strong>5. Zero Tolerance Policy:</strong> Use of abusive language or physical aggression toward hospital staff, doctors, or other patients will result in immediate removal from the system and potential legal action.</p>
                  <p><strong>6. Tele-consultation Records:</strong> If a consultation is recorded for medical training purposes, explicit verbal consent will be taken by the doctor beforehand.</p>
                  <p><strong>7. Billing & Refunds:</strong> OPD registration fees are non-refundable once the token is called by the doctor, even if the patient is not present at the time of calling.</p>
                </div>
              </div>

              <div style={styles.agreeWrapper}>
                <input 
                  type="checkbox" 
                  id="agree" 
                  checked={agreed} 
                  onChange={(e) => setAgreed(e.target.checked)} 
                  style={{width: '22px', height: '22px', cursor: 'pointer'}}
                />
                <label htmlFor="agree" style={{fontSize: '14px', fontWeight: '700', color: '#1e293b', cursor: 'pointer'}}>
                  I have read, understood, and agree to the Clinical Protocols
                </label>
              </div>

              <button 
                style={{
                  ...styles.actionCard, 
                  background: agreed ? "#0d6efd" : "#94a3b8", 
                  color: "#fff", 
                  width: '100%', 
                  textAlign: 'center', 
                  marginTop: '10px',
                  fontWeight: '800',
                  fontSize: '16px',
                  boxShadow: agreed ? '0 10px 15px -3px rgba(13, 110, 253, 0.3)' : 'none',
                  cursor: agreed ? 'pointer' : 'not-allowed'
                }} 
                disabled={!agreed}
                onClick={() => setPage("welcome")}
              >
                Accept and Enter Hospital Portal
              </button>
            </div>
          </div>
        )}

        {page === "welcome" && (
          <div style={styles.heroSection}>
            <div style={styles.glassCard}>
              <div style={styles.topHeader}>
                <div style={styles.badge}>Healthcare Excellence</div>
                <div style={{...styles.statusChip, backgroundColor: isOpen ? "#dcfce7" : "#fee2e2", color: isOpen ? "#166534" : "#991b1b"}}>
                   {isOpen ? "● Open Now" : "○ Currently Closed"}
                </div>
              </div>

              <h1 style={styles.mainTitle}>Ayushman Bharat <span style={styles.highlight}>Hospital</span></h1>
              <p style={styles.description}>Precision care meets digital innovation. Manage your journey seamlessly.</p>

              <div style={styles.healthByteContainer}>
                <div style={styles.newsLabel}>HEALTH BYTE</div>
                <div style={styles.tipWrapper}>
                   <p key={tipIndex} style={styles.tipText}>{healthTips[tipIndex]}</p>
                </div>
              </div>

              <div style={styles.actionGrid}>
                <button style={{ ...styles.actionCard, ...styles.patientCard }} onClick={() => setPage("patient")}>
                  <div style={styles.iconCircle}>📋</div>
                  <h3>Patient Portal</h3>
                  <p>Register & Check Status</p>
                </button>
                <button style={{ ...styles.actionCard, ...styles.receptionCard }} onClick={() => setPage("receptionist")}>
                  <div style={styles.iconCircle}>🏢</div>
                  <h3>Reception Desk</h3>
                  <p>Check-in & Vitals</p>
                </button>
                <button style={{ ...styles.actionCard, ...styles.doctorCard }} onClick={() => setPage("doctor")}>
                  <div style={styles.iconCircle}>👨‍⚕️</div>
                  <h3>Doctor Login</h3>
                  <p>Manage Consultations</p>
                </button>
              </div>

              <button style={styles.monitorBtn} onClick={() => setPage("bigscreen")}>🖥️ View Live OPD Monitor</button>

              <div style={styles.sectionTitleRow}>
                <h3 style={styles.subHeading}>Facility Overview</h3>
                <div style={styles.hrLine}></div>
              </div>
              <div style={styles.facilityStatsGrid}>
                <div style={styles.statBox}><strong>15+</strong><br/><small>Specialties</small></div>
                <div style={styles.statBox}><strong>24/7</strong><br/><small>Pharmacy</small></div>
                <div style={styles.statBox}><strong>500+</strong><br/><small>Daily Tokens</small></div>
                <div style={styles.statBox}><strong>Modern</strong><br/><small>ICU/Ventilators</small></div>
              </div>

              <div style={styles.emergencyBanner}>
                <div style={{textAlign: 'left'}}>
                  <h4 style={{margin: 0, color: '#991b1b'}}>🚨 Emergency Trauma Center</h4>
                  <p style={{margin: 0, fontSize: '12px', color: '#b91c1c'}}>For critical cases, call our 24/7 hotline directly.</p>
                </div>
                <a href="tel:102" style={styles.emergencyBtn}>Call 102</a>
              </div>

              {/* --- TESTIMONIALS SECTION --- */}
              <div style={styles.sectionTitleRow}>
                <h3 style={styles.subHeading}>Patient Stories</h3>
                <div style={styles.hrLine}></div>
              </div>
              <div style={styles.testimonialGrid}>
                <div style={styles.testCard}>
                  <p style={styles.testText}>"The digital token system saved me hours of waiting. Highly efficient!"</p>
                  <div style={styles.testUser}>⭐⭐⭐⭐⭐ — <strong>Suresh M.</strong></div>
                </div>
                <div style={styles.testCard}>
                  <p style={styles.testText}>"Easy registration for my elderly father. Seamless Ayushman process."</p>
                  <div style={styles.testUser}>⭐⭐⭐⭐⭐ — <strong>Priya K.</strong></div>
                </div>
              </div>

              <div style={styles.sectionTitleRow}>
                <h3 style={styles.subHeading}>Meet Our Specialists</h3>
                <div style={styles.hrLine}></div>
              </div>
              <div style={styles.specialistGrid}>
                <div style={styles.docCard}>
                  <div style={styles.docAvatar}>👨‍⚕️</div>
                  <div style={styles.docInfo}>
                    <span style={styles.docName}>Dr. Rajesh Kumar</span>
                    <span style={styles.docSub}>Chief Surgeon | MS Ortho</span>
                    <span style={styles.docStatus}>● Available</span>
                  </div>
                </div>
                <div style={styles.docCard}>
                  <div style={styles.docAvatar}>👩‍⚕️</div>
                  <div style={styles.docInfo}>
                    <span style={styles.docName}>Dr. Anjali Mehta</span>
                    <span style={styles.docSub}>Sr. Gynecologist | MD</span>
                    <span style={styles.docStatus}>● Available</span>
                  </div>
                </div>
                <div style={styles.docCard}>
                  <div style={styles.docAvatar}>👨‍⚕️</div>
                  <div style={styles.docInfo}>
                    <span style={styles.docName}>Dr. S. Vishwanath</span>
                    <span style={styles.docSub}>Physician | MBBS</span>
                    <span style={styles.docStatus}>● In Consultation</span>
                  </div>
                </div>
              </div>

              {/* --- LIVE NEWS & HEALTH ARTICLES --- */}
              <div style={styles.sectionTitleRow}>
                <h3 style={styles.subHeading}>Live News & Health Articles</h3>
                <div style={styles.hrLine}></div>
              </div>
              <div style={styles.articleGrid}>
                {healthArticles.map(article => (
                  <div key={article.id} style={styles.articleCard}>
                    <div style={styles.articleIcon}>{article.icon}</div>
                    <div style={styles.articleBody}>
                      <span style={styles.articleCategory}>{article.category}</span>
                      <h4 style={styles.articleTitle}>{article.title}</h4>
                      <span style={styles.articleReadTime}>⏱️ {article.read} read</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* --- INTERACTIVE FAQ SECTION --- */}
              <div style={styles.sectionTitleRow}>
                <h3 style={styles.subHeading}>Frequently Asked Questions</h3>
                <div style={styles.hrLine}></div>
              </div>
              <div style={styles.faqContainer}>
                {[
                  { q: "What documents are required?", a: "Valid Govt ID (Aadhar/Voter ID) or Ayushman Health ID." },
                  { q: "How do I check my queue position?", a: "Go to Patient Portal and enter your Token ID for live status." },
                  { q: "Is the Pharmacy open 24/7?", a: "Yes, our pharmacy and trauma center operate 24 hours daily." }
                ].map((item, i) => (
                  <div key={i} style={styles.faqItem} onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                    <div style={styles.faqQuestion}>
                      <span>{item.q}</span>
                      <span>{activeFaq === i ? "−" : "+"}</span>
                    </div>
                    {activeFaq === i && <div style={styles.faqAnswer}>{item.a}</div>}
                  </div>
                ))}
              </div>

              <div style={styles.sectionTitleRow}>
                <h3 style={styles.subHeading}>Hospital Directory</h3>
                <div style={styles.hrLine}></div>
              </div>
              <div style={styles.directoryGrid}>
                <div style={styles.dirSection}>
                  <h4 style={styles.dirType}>🏥 WARDS</h4>
                  <div style={styles.dirItem}><span>General Medicine</span> <b>W-101</b></div>
                  <div style={styles.dirItem}><span>Orthopedic</span> <b>W-204</b></div>
                </div>
                <div style={styles.dirSection}>
                  <h4 style={styles.dirType}>🔬 SERVICES</h4>
                  <div style={styles.dirItem}><span>Pathology Lab</span> <b>B-002</b></div>
                  <div style={styles.dirItem}><span>X-Ray Room</span> <b>B-005</b></div>
                </div>
                <div style={styles.dirSection}>
                  <h4 style={styles.dirType}>🏢 DESKS</h4>
                  <div style={styles.dirItem}><span>Reception</span> <b>Main Lobby</b></div>
                  <div style={styles.dirItem}><span>Ayushman Desk</span> <b>Gate 2</b></div>
                </div>
              </div>

              <div style={styles.timingFooter}>
                <div style={styles.timingItem}><strong>📅 Mon-Sat:</strong> 9AM-9PM</div>
                <div style={styles.timingItem}><strong>🚨 Emergency:</strong> 24/7</div>
                <div style={styles.timingItem}><strong>📍 Location:</strong> Belagavi, KA</div>
              </div>

              <div style={styles.ownerSection}>
                <div style={styles.hrLine}></div>
                <p style={styles.ownerTitle}>DESIGNED & DEVELOPED BY</p>
                <div style={styles.ownerGrid}>
                   <div style={styles.ownerItem}>🚀 Gururaj Inamdar</div>
                   <div style={styles.ownerItem}>🛠️ Darshan Kore</div>
                   <div style={styles.ownerItem}>💻 Abhishek</div>
                   <div style={styles.ownerItem}>⚙️ Abhishek Reddy</div>
                </div>
              </div>

              <div style={styles.supportSection}>
                <div style={styles.supportActions}>
                   <button onClick={contactWhatsApp} style={styles.waBtn}>💬 WhatsApp Support</button>
                   <a href={`tel:${SUPPORT_PHONE}`} style={styles.phoneBtn}>📞 {SUPPORT_PHONE}</a>
                </div>
                <p style={{fontSize: '11px', color: '#94a3b8', marginTop: '15px'}}>System ID: {SUPPORT_EMAIL}</p>
                <p style={{fontSize: '10px', color: '#cbd5e1'}}>© 2026 Ayushman Bharat Smart OPD. All Rights Reserved.</p>
              </div>
            </div>
          </div>
        )}

        {page === "patient" && <div style={styles.subPageContainer}><Patient logout={() => setPage("welcome")} /></div>}
        {page === "doctor" && <div style={styles.subPageContainer}><Doctor logout={() => setPage("welcome")} /></div>}
        {page === "receptionist" && <div style={styles.subPageContainer}><Receptionist logout={() => setPage("welcome")} /></div>}

        {page === "bigscreen" && (
          <div style={styles.monitorContainer}>
            <div style={styles.statsBar}>
               <div style={styles.statItem}><span style={styles.statLabel}>TOTAL SERVED TODAY</span><span style={styles.statValue}>{totalServed}</span></div>
               <div style={styles.statItem}><span style={styles.statLabel}>STATUS</span><span style={{...styles.statValue, color: '#10b981'}}>● LIVE</span></div>
            </div>
            <div style={styles.monitorHeader}>
              <h2 style={styles.monitorTitle}>Live OPD Queue</h2>
              <button style={styles.exitBtn} onClick={() => setPage("welcome")}>Back</button>
            </div>
            <div style={styles.queueGrid}>
              <WardDisplay ward="Gynecologist" />
              <WardDisplay ward="Orthopedic" />
              <WardDisplay ward="Dermatology" />
              <WardDisplay ward="General" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  appWrapper: { minHeight: "100vh", position: "relative", background: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000') center/cover no-repeat fixed", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(135deg, rgba(11, 94, 215, 0.85) 0%, rgba(15, 23, 42, 0.9) 100%)", zIndex: 1 },
  contentContainer: { position: "relative", zIndex: 2, width: "100%", maxWidth: "1100px", padding: "40px 20px" },
  heroSection: { display: "flex", justifyContent: "center" },
  glassCard: { background: "rgba(255, 255, 255, 0.98)", padding: "40px 50px", borderRadius: "30px", textAlign: "center", width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" },
  topHeader: { display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", marginBottom: "20px" },
  badge: { padding: "6px 16px", background: "#e7f1ff", color: "#0d6efd", borderRadius: "50px", fontSize: "12px", fontWeight: "600" },
  statusChip: { padding: "6px 16px", borderRadius: "50px", fontSize: "12px", fontWeight: "700" },
  mainTitle: { fontSize: "2.8rem", fontWeight: "800", color: "#1e293b", margin: "0 0 10px 0" },
  highlight: { color: "#0d6efd" },
  description: { fontSize: "1rem", color: "#64748b", marginBottom: "25px" },
  healthByteContainer: { background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '15px', display: 'flex', alignItems: 'center', margin: '0 auto 30px auto', maxWidth: '850px', padding: '5px' },
  newsLabel: { background: '#0284c7', color: '#fff', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold', fontSize: '11px' },
  tipWrapper: { flex: 1, padding: '0 15px', textAlign: 'left' },
  tipText: { fontSize: '1.1rem', fontWeight: '600', color: '#0369a1', margin: 0 },
  actionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "25px" },
  actionCard: { padding: "20px", borderRadius: "20px", border: "none", cursor: "pointer", textAlign: "left", transition: '0.3s' },
  patientCard: { background: "#0d6efd", color: "#fff" },
  receptionCard: { background: "#0f172a", color: "#fff" },
  doctorCard: { background: "#fff", color: "#1e293b", border: "1px solid #e2e8f0" },
  iconCircle: { fontSize: "1.8rem", marginBottom: "10px" },
  monitorBtn: { width: "100%", padding: "15px", borderRadius: "15px", border: "2px solid #0d6efd", background: "transparent", color: "#0d6efd", fontWeight: "bold", cursor: "pointer", marginBottom: "35px" },
  sectionTitleRow: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', marginTop: '30px' },
  subHeading: { color: '#1e293b', fontSize: '16px', fontWeight: 'bold', whiteSpace: 'nowrap' },
  hrLine: { flex: 1, height: '1px', background: '#e2e8f0' },
  facilityStatsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '25px' },
  statBox: { background: '#fff', border: '1px solid #e2e8f0', padding: '15px 5px', borderRadius: '15px', color: '#0d6efd', fontSize: '18px' },
  emergencyBanner: { background: '#fee2e2', border: '1px solid #fecaca', padding: '15px 25px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  emergencyBtn: { background: '#ef4444', color: '#fff', padding: '10px 20px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' },
  specialistGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' },
  docCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', background: '#f8fafc', borderRadius: '15px', border: '1px solid #f1f5f9', textAlign: 'left' },
  docAvatar: { width: '45px', height: '45px', background: '#e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  docInfo: { display: 'flex', flexDirection: 'column' },
  docName: { fontWeight: '700', color: '#1e293b', fontSize: '13px' },
  docSub: { color: '#64748b', fontSize: '11px' },
  docStatus: { color: '#10b981', fontSize: '10px', fontWeight: 'bold', marginTop: '2px' },
  
  // Testimonials
  testimonialGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' },
  testCard: { background: '#f0f9ff', padding: '20px', borderRadius: '20px', borderLeft: '5px solid #0d6efd', textAlign: 'left' },
  testText: { fontStyle: 'italic', fontSize: '13px', color: '#334155', marginBottom: '10px' },
  testUser: { fontSize: '12px', color: '#64748b' },

  // Articles
  articleGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px', marginBottom: '30px' },
  articleCard: { display: 'flex', gap: '15px', padding: '15px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '18px', textAlign: 'left' },
  articleIcon: { fontSize: '24px', background: '#f1f5f9', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  articleBody: { display: 'flex', flexDirection: 'column', gap: '4px' },
  articleCategory: { fontSize: '10px', fontWeight: '800', color: '#0d6efd', letterSpacing: '1px' },
  articleTitle: { fontSize: '14px', fontWeight: '700', color: '#1e293b', margin: 0, lineHeight: '1.4' },
  articleReadTime: { fontSize: '11px', color: '#94a3b8', marginTop: '5px' },

  // FAQ
  faqContainer: { textAlign: 'left', marginBottom: '30px' },
  faqItem: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '10px', cursor: 'pointer', overflow: 'hidden' },
  faqQuestion: { padding: '15px', fontWeight: '700', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#1e293b' },
  faqAnswer: { padding: '0 15px 15px 15px', fontSize: '13px', color: '#64748b', lineHeight: '1.5', borderTop: '1px solid #f1f5f9', paddingTop: '10px' },

  directoryGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', textAlign: 'left', marginBottom: '30px' },
  dirSection: { display: 'flex', flexDirection: 'column', gap: '8px' },
  dirType: { fontSize: '11px', color: '#64748b', fontWeight: '800', borderBottom: '2px solid #0d6efd', paddingBottom: '3px' },
  dirItem: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#334155' },
  timingFooter: { display: 'flex', justifyContent: 'space-around', background: '#1e293b', color: '#fff', padding: '15px', borderRadius: '15px', marginTop: '10px', fontSize: '12px' },
  timingItem: { display: 'flex', gap: '5px' },
  ownerSection: { marginTop: '40px', padding: '20px 0' },
  ownerTitle: { fontSize: '11px', fontWeight: '800', color: '#64748b', letterSpacing: '2px', marginBottom: '15px' },
  ownerGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  ownerItem: { background: '#f8fafc', padding: '10px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', color: '#1e293b', border: '1px solid #e2e8f0' },
  supportSection: { borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '25px' },
  supportActions: { display: 'flex', gap: '10px', justifyContent: 'center' },
  waBtn: { background: '#25D366', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold' },
  phoneBtn: { background: '#0d6efd', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px' },
  subPageContainer: { background: "#f8fafc", padding: "30px", borderRadius: "24px" },
  monitorContainer: { background: "rgba(15, 23, 42, 0.95)", padding: "30px", borderRadius: "24px", color: "#fff" },
  monitorHeader: { display: "flex", justifyContent: "space-between", marginBottom: "20px" },
  monitorTitle: { fontSize: "1.8rem" },
  statsBar: { display: "flex", gap: "30px", marginBottom: "20px" },
  statItem: { display: "flex", flexDirection: "column" },
  statLabel: { color: "#94a3b8", fontSize: "9px", fontWeight: "800" },
  statValue: { color: "#fff", fontSize: "14px", fontWeight: "600" },
  exitBtn: { background: "#ef4444", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px" },
  queueGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "20px" },
  awardsContainer: { background: '#fff9db', border: '1px solid #ffec99', padding: '20px', borderRadius: '15px', margin: '20px 0', textAlign: 'left' },
  awardsGrid: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', fontSize: '14px', color: '#856404', fontWeight: '600' },
  awardItem: { display: 'flex', alignItems: 'center', gap: '8px' },
  termsBox: { background: '#fff', border: '1.5px solid #e2e8f0', padding: '20px', borderRadius: '20px', textAlign: 'left', marginBottom: '15px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' },
  termsContent: { maxHeight: '250px', overflowY: 'auto', paddingRight: '10px', color: '#475569', fontSize: '13px', lineHeight: '1.7' },
  agreeWrapper: { display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center', margin: '20px 0', padding: '15px', background: '#f1f5f9', borderRadius: '12px' }
};