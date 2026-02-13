const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

const NORMAL_TIME = 10;
const EMERGENCY_TIME = 20;
const BREAK_DURATION = 30; 
let totalServedToday = 0;

/* ================= HELPERS ================= */
const timeToMinutes = t => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = m => {
  const normalizedMinutes = m % 1440; 
  return new Date(0, 0, 0, Math.floor(normalizedMinutes / 60), normalizedMinutes % 60).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};

function getIndianMinutesNow() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 5.5 * 60 * 60000);
  return ist.getHours() * 60 + ist.getMinutes();
}

/* ================= DATA & CONFIG ================= */
const doctors = {
  Gynecologist: { name: "Anjali", genStart: "06:00", genEnd: "23:00", onBreak: false, breakEndTime: 0 },
  Orthopedic: { name: "Ramesh", genStart: "06:00", genEnd: "23:00", onBreak: false, breakEndTime: 0 },
  Dermatology: { name: "Priya", genStart: "06:00", genEnd: "23:00", onBreak: false, breakEndTime: 0 },
  General: { name: "Kumar", genStart: "06:00", genEnd: "23:00", onBreak: false, breakEndTime: 0 }
};

const doctorAccounts = {
  Gynecologist: { username: "gyn", password: "1234" },
  Orthopedic: { username: "ortho", password: "1234" },
  Dermatology: { username: "derma", password: "1234" },
  General: { username: "general", password: "1234" }
};

const receptionAccount = { username: "admin", password: "99" };

const queues = { Gynecologist: [], Orthopedic: [], Dermatology: [], General: [] };
const nowServing = { Gynecologist: null, Orthopedic: null, Dermatology: null, General: null };

const wardClock = {};
Object.keys(doctors).forEach(ward => {
  wardClock[ward] = getIndianMinutesNow();
});

function calculateTime(ward) {
  let currentTimeIST = getIndianMinutesNow();
  const doc = doctors[ward];
  
  if (doc.onBreak && doc.breakEndTime > currentTimeIST) {
    wardClock[ward] = doc.breakEndTime;
  } else if (wardClock[ward] < currentTimeIST) { 
    wardClock[ward] = currentTimeIST; 
  }

  let runningTime = wardClock[ward];
  const genStart = timeToMinutes("06:00");
  const genEnd = timeToMinutes("23:00");
  
  queues[ward] = queues[ward].map(p => {
    if (p.emergency) {
      const timeStr = minutesToTime(runningTime);
      runningTime += EMERGENCY_TIME;
      return { ...p, estimatedTime: timeStr };
    } else {
      if (runningTime < genStart) runningTime = genStart;
      if (runningTime >= genEnd) return { ...p, estimatedTime: "OPD Closed" };
      const timeStr = minutesToTime(runningTime);
      runningTime += NORMAL_TIME;
      return { ...p, estimatedTime: timeStr };
    }
  });
}

/* ================= AUTH ENDPOINTS ================= */

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const ward = Object.keys(doctorAccounts).find(
    w => doctorAccounts[w].username === username && doctorAccounts[w].password === password
  );
  if (ward) {
    res.json({ ward, doctor: doctors[ward], message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid Physician Credentials" });
  }
});

app.post("/api/reception-login", (req, res) => {
  const { username, password } = req.body;
  if (username === receptionAccount.username && password === receptionAccount.password) {
    res.json({ success: true, message: "Reception Access Granted" });
  } else {
    res.status(401).json({ message: "Invalid Staff Credentials" });
  }
});

/* ================= CORE API ENDPOINTS ================= */

app.get("/api/queues", (req, res) => { res.json(queues); });

app.get("/api/queue/:ward", (req, res) => {
  const ward = req.params.ward;
  res.json({
    queue: queues[ward] || [],
    nowServing: nowServing[ward],
    doctor: doctors[ward]
  });
});

app.post("/api/book", (req, res) => {
  const { name, phone, ward, emergency } = req.body;
  
  const exists = Object.values(queues).flat().find(p => p.phone === phone);
  if (exists) return res.status(400).json({ message: "This phone number is aleardy booked ." });

  const prefix = ward.substring(0, 3).toUpperCase(); 
  const tokenNumber = queues[ward].length + 101;
  const token = `${prefix}${tokenNumber}`; 

  const patient = { 
    token, 
    name, 
    phone, 
    ward, 
    emergency: !!emergency, 
    checkedIn: false, 
    vitals: null
  };

  if (emergency) { queues[ward].unshift(patient); } else { queues[ward].push(patient); }
  calculateTime(ward);
  
  const bookedPatient = queues[ward].find(p => p.token === token);
  res.json({ ...bookedPatient, doctor: doctors[ward].name, position: queues[ward].indexOf(bookedPatient) + 1 });
});

app.post("/api/checkin", (req, res) => {
  const { qrData, vitals } = req.body;
  let tokenToMatch = qrData.startsWith("ABH-") ? qrData.split("-")[1] : qrData.trim().toUpperCase();

  let found = null;
  Object.keys(queues).forEach(w => {
    const p = queues[w].find(p => p.token === tokenToMatch);
    if (p) { 
      p.checkedIn = true; 
      p.vitals = vitals; 
      found = p; 
    }
  });
  
  if (found) {
    res.json({ message: `Verified: ${found.name}`, patient: found });
  } else {
    res.status(404).json({ message: `Token ${tokenToMatch} not found` });
  }
});

/* ================= DOCTOR ACTIONS ================= */

app.post("/api/toggle-break/:ward", (req, res) => {
  const ward = req.params.ward;
  const doc = doctors[ward];
  if (!doc) return res.status(404).json({ message: "Ward not found" });

  doc.onBreak = !doc.onBreak;
  doc.breakEndTime = doc.onBreak ? getIndianMinutesNow() + BREAK_DURATION : 0;
  
  calculateTime(ward);
  res.json({ onBreak: doc.onBreak });
});

app.post("/api/call-next/:ward", (req, res) => {
  const ward = req.params.ward;
  if (doctors[ward].onBreak) return res.status(400).json({ message: "End Break to call patients" });
  
  // Logic simplified: Only checks if the patient has checkedIn. Payment check removed.
  const index = queues[ward].findIndex(p => p.checkedIn === true);
  
  if (index !== -1) {
    const served = queues[ward].splice(index, 1)[0]; 
    wardClock[ward] = getIndianMinutesNow() + (served.emergency ? EMERGENCY_TIME : NORMAL_TIME);
    totalServedToday++; 
    nowServing[ward] = served;
    calculateTime(ward);
    res.json(served);
  } else { 
    res.status(400).json({ message: "No Arrived Patients in Queue" }); 
  }
});

app.post("/api/finish-consultation/:ward", (req, res) => {
  const ward = req.params.ward;
  nowServing[ward] = null;
  res.json({ message: "Consultation Cleared" });
});

/* ================= START SERVER ================= */

const PORT = 5055;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`
  ==========================================
  HOSPITAL BACKEND LIVE (PAYMENTS REMOVED)
  URL: http://127.0.0.1:${PORT}
  ==========================================
  `);
});