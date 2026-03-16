const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const Attendance = require("../models/Attendance");

// List Users for dashboard
router.get("/users", adminController.listUsers);

// Create Admin
router.post("/create-admin", adminController.setAdminPassword);

// Admin Login
router.post("/login", adminController.loginAdmin);

// Get all attendance records for admin dashboard
router.get("/attendance", async (req, res) => {
    try {
        // Populate userId with name and email
        const records = await Attendance.find().populate("userId", "name email").sort({ date: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch attendance records" });
    }
});

module.exports = router;