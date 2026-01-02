const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ===== TIME CONFIG =====
const START_HOUR = 10;
const START_MIN = 0;
const NORMAL_TIME = 10;    // 10 minutes
const EMERGENCY_TIME = 20; // 20 minutes

function calculateTime(queue) {
  let currentMinutes = START_HOUR * 60 + START_MIN;

  return queue.map(p => {
    const time = new Date();
    time.setHours(Math.floor(currentMinutes / 60));
    time.setMinutes(currentMinutes % 60);

    const estimatedTime = time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

    currentMinutes += p.emergency ? EMERGENCY_TIME : NORMAL_TIME;

    return { ...p, estimatedTime };
  });
}

// ---------- QUEUES ----------
const queues = {
  Gynecologist: [],
  Orthopedic: [],
  Dermatology: [],
  General: []
};

const nowServing = {
  Gynecologist: null,
  Orthopedic: null,
  Dermatology: null,
  General: null
};

// ---------- BOOK TOKEN ----------
app.post("/api/book", (req, res) => {
  const { name, phone, ward, emergency } = req.body;

  if (!name || !phone || !ward)
    return res.status(400).json({ message: "Invalid input" });

  const exists = Object.values(queues)
    .flat()
    .find(p => p.phone === phone);
  if (exists)
    return res.status(400).json({ message: "Phone already used" });

  const token = ward[0] + (queues[ward].length + 1);

  const patient = { token, name, phone, emergency };

  emergency
    ? queues[ward].unshift(patient)
    : queues[ward].push(patient);

  queues[ward] = calculateTime(queues[ward]);

  res.json({
    token,
    estimatedTime: queues[ward].find(p => p.token === token).estimatedTime,
    message: "Token booked successfully"
  });
});

// ---------- GET QUEUE ----------
app.get("/api/queue/:ward", (req, res) => {
  const ward = req.params.ward;
  res.json({
    nowServing: nowServing[ward],
    queue: queues[ward]
  });
});

// ---------- CALL NEXT ----------
app.post("/api/call-next/:ward", (req, res) => {
  const ward = req.params.ward;
  nowServing[ward] = queues[ward].shift() || null;
  queues[ward] = calculateTime(queues[ward]);
  res.json(nowServing[ward]);
});

app.listen(5055, () =>
  console.log("✅ Backend running on http://127.0.0.1:5055")
);
