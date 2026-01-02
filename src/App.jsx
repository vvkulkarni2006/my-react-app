import { useState, useEffect } from "react";
import Patient from "./Patient";
import Doctor from "./Doctor";
import WardDisplay from "./WardDisplay";

export default function App() {
  const [page, setPage] = useState("welcome");

  useEffect(() => {
    document.title = "Ayushman Bharat Hospital";
  }, []);

  return (
    <div style={styles.app}>
      <div style={styles.desktopContainer}>
        {/* ========== WELCOME PAGE ========== */}
        {page === "welcome" && (
          <div style={styles.welcome}>
            <div style={styles.welcomeLeft}>
              <h1>Ayushman Bharat Hospital</h1>
              <p>Smart Queue Management System</p>

              <button style={styles.primary} onClick={() => setPage("patient")}>
                Patient Registration
              </button>

              <button style={styles.outline} onClick={() => setPage("doctor")}>
                Doctor Login
              </button>

              <button style={styles.secondary} onClick={() => setPage("bigscreen")}>
                Big Screen Display
              </button>
            </div>

            <div style={styles.welcomeRight}>
              🏥
            </div>
          </div>
        )}

        {/* ========== PATIENT PAGE ========== */}
        {page === "patient" && (
          <Patient logout={() => setPage("welcome")} />
        )}

        {/* ========== DOCTOR PAGE ========== */}
        {page === "doctor" && (
          <Doctor logout={() => setPage("welcome")} />
        )}

        {/* ========== BIG SCREEN ========== */}
        {page === "bigscreen" && (
          <div>
            <div style={styles.bigHeader}>
              <h1>Live OPD Queue Display</h1>
              <button style={styles.exitBtn} onClick={() => setPage("welcome")}>
                Exit
              </button>
            </div>

            <div style={styles.grid}>
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

/* ================= STYLES ================= */

const styles = {
  app: {
    minHeight: "100vh",
    background: "#F4F7FB",
    fontFamily: "Segoe UI, Roboto, sans-serif"
  },

  /* 🔥 THIS IS THE KEY CHANGE */
  desktopContainer: {
    maxWidth: "1600px",   // ⬅️ TRUE DESKTOP WIDTH
    margin: "0 auto",
    padding: "40px"
  },

  /* ===== WELCOME ===== */
  welcome: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    padding: "60px",
    borderRadius: 20,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
  },
  welcomeLeft: {
    maxWidth: 600
  },
  welcomeRight: {
    fontSize: 140
  },

  primary: {
    width: 300,
    padding: 16,
    marginTop: 20,
    background: "#0B5ED7",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 17,
    cursor: "pointer"
  },
  outline: {
    width: 300,
    padding: 16,
    marginTop: 20,
    background: "#fff",
    border: "2px solid #0B5ED7",
    color: "#0B5ED7",
    borderRadius: 10,
    fontSize: 17,
    cursor: "pointer"
  },
  secondary: {
    width: 300,
    padding: 16,
    marginTop: 20,
    background: "#198754",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 17,
    cursor: "pointer"
  },

  /* ===== BIG SCREEN ===== */
  bigHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30
  },
  exitBtn: {
    padding: "12px 24px",
    background: "#DC3545",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 16,
    cursor: "pointer"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 30
  }
};
