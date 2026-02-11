const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const NORMAL_TIME = 10;
const EMERGENCY_TIME = 20;
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
  Gynecologist: { name: "Anjali", genStart: "06:00", genEnd: "23:00" },
  Orthopedic: { name: "Ramesh", genStart: "06:00", genEnd: "23:00" },
  Dermatology: { name: "Priya", genStart: "06:00", genEnd: "23:00" },
  General: { name: "Kumar", genStart: "06:00", genEnd: "23:00" }
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

/* ================= LOGIC ================= */
function calculateTime(ward) {
  let currentTimeIST = getIndianMinutesNow();
  if (wardClock[ward] < currentTimeIST) {
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

/* ================= API ENDPOINTS ================= */
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const ward = Object.keys(doctorAccounts).find(
    w => doctorAccounts[w].username === username && doctorAccounts[w].password === password
  );
  if (!ward) return res.status(401).json({ message: "Invalid login" });
  res.json({ ward, doctor: doctors[ward] });
});

app.post("/api/reception-login", (req, res) => {
  const { username, password } = req.body;
  if (username === receptionAccount.username && password === receptionAccount.password) {
    res.json({ success: true });
  } else {
    res.status(401).json({ message: "Invalid Admin Credentials" });
  }
});

app.post("/api/book", (req, res) => {
  const { name, phone, ward, emergency } = req.body;
  const exists = Object.values(queues).flat().find(p => p.phone === phone);
  if (exists) return res.status(400).json({ message: "Phone already used" });

  const token = ward[0] + (queues[ward].length + 1);
  const patient = { token, name, phone, emergency: !!emergency, checkedIn: false };
  
  emergency ? queues[ward].unshift(patient) : queues[ward].push(patient);
  calculateTime(ward);

  const booked = queues[ward].find(p => p.token === token);
  res.json({ token, estimatedTime: booked.estimatedTime, doctor: doctors[ward].name, position: queues[ward].indexOf(booked) + 1 });
});

app.post("/api/checkin", (req, res) => {
  const { qrData } = req.body;
  const token = qrData.split("-")[1];
  let found = null;
  Object.keys(queues).forEach(w => {
    const p = queues[w].find(p => p.token === token);
    if (p) { p.checkedIn = true; found = p; }
  });
  if (found) res.json({ message: `Verified: ${found.name}`, patient: found });
  else res.status(404).json({ message: "Token not found" });
});

app.get("/api/queue/:ward", (req, res) => {
  const ward = req.params.ward;
  res.json({ doctor: doctors[ward], nowServing: nowServing[ward], queue: queues[ward] });
});

app.post("/api/call-next/:ward", (req, res) => {
  const ward = req.params.ward;
  
  // FIXED LOGIC: Find index of first verified patient
  const index = queues[ward].findIndex(p => p.checkedIn === true);

  if (index !== -1) {
    const served = queues[ward].splice(index, 1)[0]; 
    wardClock[ward] = getIndianMinutesNow() + (served.emergency ? EMERGENCY_TIME : NORMAL_TIME);
    totalServedToday++; 
    nowServing[ward] = served;
    calculateTime(ward);
    res.json(served);
  } else {
    res.status(400).json({ message: "No Arrived Patients to Call" });
  }
});

app.listen(5055, () => console.log("Backend running on http://127.0.0.1:5055"));