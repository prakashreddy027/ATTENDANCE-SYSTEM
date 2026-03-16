const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Attendance = require("../models/Attendance");

// Authentication middleware
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; // Use 'id' from JWT payload
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
}

// CREATE EMPLOYEE
router.post("/create", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const newUser = new User({ name, email, phone, password });
        await newUser.save();
        res.json({ success: true, message: "Employee created" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// GET logged-in employee info
router.get("/me", authenticate, async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ name: user.name, email: user.email });
});

// GET attendance history for employee
router.get("/attendance", authenticate, async (req, res) => {
    const records = await Attendance.find({ userId: req.userId });
    res.json(records);
});

// POST punch in/out
router.post("/punch", authenticate, async (req, res) => {
    const { type } = req.body;
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    let attendance = await Attendance.findOne({ userId: req.userId, date });
    if (!attendance) {
        attendance = new Attendance({ userId: req.userId, date });
    }
    if (type === "in") attendance.loginTime = now;
    if (type === "out") attendance.logoutTime = now;
    await attendance.save();
    res.json({ success: true, message: `Punch ${type} recorded.` });
});

module.exports = router;