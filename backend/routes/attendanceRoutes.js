const express = require("express");
const router = express.Router();
const User = require("../models/user");
const attendanceController = require("../controllers/attendanceController");
const { verifyToken } = require("../middleware/authmiddleware");

router.post("/login", async (req, res) => {

    const { email } = req.body;

    const user = await User.findOne({ email });

    user.loginTime = new Date().toLocaleTimeString();

    await user.save();

    res.json({ message: "Login recorded" });

});


router.post("/logout", async (req, res) => {

    const { email } = req.body;

    const user = await User.findOne({ email });

    user.logoutTime = new Date().toLocaleTimeString();

    await user.save();

    res.json({ message: "Logout recorded" });

});

// Endpoint to generate punch in/punch out token
router.post("/generate-attendance-token", verifyToken, attendanceController.generateAttendanceToken);

module.exports = router;