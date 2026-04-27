const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve HTML

/* ================= DATABASE ================= */
let users = [];
let riders = [];
let rides = [];

let userId = 1;
let riderId = 1;
let rideId = 1;

/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ================= USER ================= */
app.post("/api/users/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const user = { id: userId++, name, email, password };
  users.push(user);

  res.json({ message: "User registered", user });
});

/* ================= RIDER ================= */
app.post("/api/riders/register", (req, res) => {
  const { name, motorcycle, plateNumber } = req.body;

  if (!name || !motorcycle || !plateNumber) {
    return res.status(400).json({ message: "All fields required" });
  }

  const rider = {
    id: riderId++,
    name,
    motorcycle,
    plateNumber,
    available: true
  };

  riders.push(rider);

  res.json({ message: "Rider registered", rider });
});

/* ================= BOOK RIDE ================= */
app.post("/api/rides/book", (req, res) => {
  const { userId: uid, pickupLocation, dropoffLocation } = req.body;

  const user = users.find(u => u.id === uid);
  if (!user) return res.status(404).json({ message: "User not found" });

  const rider = riders.find(r => r.available);

  const ride = {
    rideId: rideId++,
    userId: uid,
    riderId: rider ? rider.id : null,
    pickupLocation,
    dropoffLocation,
    status: rider ? "on-going" : "pending"
  };

  if (rider) rider.available = false;

  rides.push(ride);

  res.json({ message: "Ride booked", ride });
});

/* ================= UPDATE ================= */
app.put("/api/rides/:id/cancel", (req, res) => {
    const ride = rides.find(r => r.rideId == req.params.id);
  
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
  
    ride.status = "cancelled";
  
    // Make rider available again
    const rider = riders.find(r => r.id === ride.riderId);
    if (rider) rider.available = true;
  
    res.json({ message: "Ride cancelled", ride });
  });

/* ================= CANCEL ================= */
app.delete("/api/rides/:id", (req, res) => {
  const index = rides.findIndex(r => r.rideId == req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Ride not found" });
  }

  const ride = rides[index];

  const rider = riders.find(r => r.id === ride.riderId);
  if (rider) rider.available = true;

  rides.splice(index, 1);

  res.json({ message: "Ride cancelled" });
});

/* ================= VIEW ================= */
app.get("/api/rides", (req, res) => {
  res.json(rides);
});

/* ================= START ================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});