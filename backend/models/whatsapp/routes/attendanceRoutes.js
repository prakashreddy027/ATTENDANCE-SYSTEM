const router = require("express").Router();
const Attendance = require("../models/Attendance");
const { verifyToken } = require("../middleware/authMiddleware");

/**
 * ✅ Punch In
 */
router.post("/punchin", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    // Check if user already punched in
    const existing = await Attendance.findOne({ userId, date: today });
    if (existing) {
      return res.status(400).json({ message: "Already punched in today" });
    }

    const record = await Attendance.create({
      userId,
      date: today,
      loginTime: now,
      ipAddress: req.ip,
      device: req.headers["user-agent"],
    });

    res.json({ success: true, message: "Punch-in successful", data: record });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ Punch Out
 */
router.post("/punchout", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    const record = await Attendance.findOne({ userId, date: today });
    if (!record) {
      return res.status(400).json({ message: "No punch-in found for today" });
    }

    if (record.logoutTime) {
      return res.status(400).json({ message: "Already punched out" });
    }

    record.logoutTime = now;
    await record.save();

    res.json({ success: true, message: "Punch-out successful", data: record });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ✅ My Attendance (Employee read-only)
 */
router.get("/my", verifyToken, async (req, res) => {
  try {
    const data = await Attendance.find({
      userId: req.user.id,
    }).sort({ date: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;