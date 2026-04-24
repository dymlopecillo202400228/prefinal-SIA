const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// DATA
let users = [];
let riders = [];
let rides = [];

let userId = 1;
let riderId = 1;
let rideId = 1;
    
app.post('/api/users/register', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ message: "All fields are required" });
    }

    const existing = users.find(u => u.email === email);
    if (existing) {
        return res.json({ message: "Email already exists" });
    }

    const user = { id: userId++, name, email, password };
    users.push(user);

    console.log("Users:", users); 

    res.json({ message: "User registered successfully", user });
});

app.post('/api/users/login', (req, res) => {
    const { email, password } = req.body;

    console.log("Login attempt:", email, password); 

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", user });
});

app.get('/api/users', (req, res) => {
    res.json(users);
});


app.post('/api/riders', (req, res) => {
    const { name, motorcycle, plateNumber } = req.body;

    if (!name || !motorcycle || !plateNumber) {
        return res.json({ message: "All fields are required" });
    }

    const rider = {
        id: riderId++,
        name,
        motorcycle,
        plateNumber,
        available: true
    };

    riders.push(rider);

    res.json({ message: "Rider added", rider });
});

app.get('/api/riders', (req, res) => {
    res.json(riders);
});

app.post('/api/rides', (req, res) => {
    const { userId, pickup, dropoff } = req.body;

    if (!userId || !pickup || !dropoff) {
        return res.json({ message: "All fields are required" });
    }

    const user = users.find(u => u.id == userId);
    if (!user) return res.json({ message: "User not found" });

    const rider = riders.find(r => r.available);
    if (!rider) return res.json({ message: "No available riders" });

    rider.available = false;

    const ride = {
        id: rideId++,
        userId,
        riderId: rider.id,
        pickup,
        dropoff,
        status: "pending"
    };

    rides.push(ride);

    res.json({ message: "Ride booked", ride });
});

app.get('/api/rides', (req, res) => {
    res.json(rides);
});

app.put('/api/rides/:id', (req, res) => {
    const ride = rides.find(r => r.id == req.params.id);

    if (!ride) return res.json({ message: "Ride not found" });

    ride.status = req.body.status;

    if (ride.status === "completed" || ride.status === "cancelled") {
        const rider = riders.find(r => r.id === ride.riderId);
        if (rider) rider.available = true;
    }

    res.json({ message: "Ride updated" });
});

app.delete('/api/rides/:id', (req, res) => {
    const index = rides.findIndex(r => r.id == req.params.id);

    if (index === -1) return res.json({ message: "Ride not found" });

    const ride = rides[index];

    const rider = riders.find(r => r.id === ride.riderId);
    if (rider) rider.available = true;

    rides.splice(index, 1);

    res.json({ message: "Ride cancelled" });
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});