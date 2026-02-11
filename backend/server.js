const express = require("express");
const cors = require("cors");
const app = express();

// 1. UPDATED CORS: Point specifically to your live Vercel URL
app.use(cors({
  origin: "https://my-react-app-aj2h.vercel.app", 
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

/* ================= HELPERS & DATA ================= */
const NORMAL_TIME = 10;
const EMERGENCY_TIME = 20;
let totalServedToday = 0;

const timeToMinutes = t => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = m => {
  const normalizedMinutes = m % 1440; 
  return new Date(0, 0, 0, Math.floor(normalizedMinutes / 60), normalizedMinutes % 60).toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit", hour12: true
  });
};

function getIndianMinutesNow() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 5.5 * 60 * 60000);
  return ist.getHours() * 60 + ist.getMinutes();
}

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
Object.keys(doctors).forEach(ward => { wardClock[ward] = getIndianMinutesNow(); });

function calculateTime(ward) {
  let currentTimeIST = getIndianMinutesNow();
  if (wardClock[ward] < currentTimeIST) wardClock[ward] = currentTimeIST;
  let runningTime = wardClock[ward];
  queues[ward] = queues[ward].map(p => {
    const timeStr = minutesToTime(runningTime);
    runningTime += p.emergency ? EMERGENCY_TIME : NORMAL_TIME;
    return { ...p, estimatedTime: timeStr };
  });
}

/* ================= API ENDPOINTS ================= */

// Health Check
app.get("/", (req, res) => res.send("Ayushman Bharat Backend is Running..."));

// Stats route for App.jsx
app.get("/api/stats", (req, res) => res.json({ totalServed: totalServedToday }));

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const ward = Object.keys(doctorAccounts).find(w => doctorAccounts[w].username === username && doctorAccounts[w].password === password);
  if (!ward) return res.status(401).json({ message: "Invalid login" });
  res.json({ ward, doctor: doctors[ward] });
});

app.post("/api/reception-login", (req, res) => {
  const { username, password } = req.body;
  if (username === receptionAccount.username && password === receptionAccount.password) res.json({ success: true });
  else res.status(401).json({ message: "Invalid Admin Credentials" });
});

app.post("/api/book", (req, res) => {
  const { name, phone, ward, emergency } = req.body;
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
  res.json({ doctor: doctors[req.params.ward], nowServing: nowServing[req.params.ward], queue: queues[req.params.ward] });
});

app.post("/api/call-next/:ward", (req, res) => {
  const ward = req.params.ward;
  const index = queues[ward].findIndex(p => p.checkedIn === true);
  if (index !== -1) {
    const served = queues[ward].splice(index, 1)[0]; 
    totalServedToday++; 
    nowServing[ward] = served;
    calculateTime(ward);
    res.json(served);
  } else {
    nowServing[ward] = null;
    res.json({ message: "Queue empty", nowServing: null });
  }
});

const PORT = process.env.PORT || 5055;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));