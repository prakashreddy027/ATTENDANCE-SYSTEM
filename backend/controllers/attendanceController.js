const Attendance = require("../models/Attendance");

exports.login = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    const existing = await Attendance.findOne({ userId, date: today });
    if (existing) {
      return res.status(400).json({ message: "Already logged in today" });
    }

    const record = await Attendance.create({
      userId,
      date: today,
      loginTime: now,
    });

    res.json({ message: "Login recorded", data: record });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    const record = await Attendance.findOne({ userId, date: today });
    if (!record) {
      return res.status(400).json({ message: "No login record found" });
    }

    record.logoutTime = now;
    await record.save();

    res.json({ message: "Logout recorded", data: record });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getUserAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const records = await Attendance.find({ userId });

    res.json({ message: "Attendance records retrieved", data: records });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    const existing = await Attendance.findOne({ userId, date: today });
    if (existing) {
      return res.status(400).json({ message: "Attendance already marked for today" });
    }

    const record = await Attendance.create({
      userId,
      date: today,
      loginTime: now,
    });

    res.json({ message: "Attendance marked", data: record });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Punch In Controller
exports.punchIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    // Check if user already punched in today
    const existingAttendance = await Attendance.findOne({ userId, date: today });
    if (existingAttendance) {
      return res.status(400).json({ message: "You have already punched in today." });
    }

    // Create new attendance record
    const attendance = await Attendance.create({
      userId,
      date: today,
      loginTime: now,
    });

    res.status(201).json({ message: "Punch-in successful", attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to punch in", error: error.message });
  }
};

// Punch Out Controller
exports.punchOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    // Find today's attendance record
    const attendance = await Attendance.findOne({ userId, date: today });

    if (!attendance) {
      return res.status(400).json({ message: "No punch-in record found for today." });
    }

    if (attendance.logoutTime) {
      return res.status(400).json({ message: "You have already punched out today." });
    }

    // Update logout time
    attendance.logoutTime = now;
    await attendance.save();

    res.status(200).json({ message: "Punch-out successful", attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to punch out", error: error.message });
  }
};

// Generate Attendance Action Token
exports.generateAttendanceToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { action } = req.body; // 'punchIn' or 'punchOut'
    if (!action || !["punchIn", "punchOut"].includes(action)) {
      return res.status(400).json({ message: "Invalid action type" });
    }
    const timestamp = Date.now();
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ userId, action, timestamp }, process.env.JWT_SECRET, { expiresIn: "5m" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate token", error: err.message });
  }
};

// Get My Attendance Controller
exports.getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch attendance records for the user
    const attendanceRecords = await Attendance.find({ userId }).sort({ date: -1 });

    res.status(200).json({ message: "Attendance records fetched successfully", attendanceRecords });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch attendance records", error: error.message });
  }
};

// Get All Attendance Controller (Admin)
exports.getAllAttendance = async (req, res) => {
  try {
    // Fetch all attendance records
    const attendanceRecords = await Attendance.find().populate("userId", "name email").sort({ date: -1 });

    res.status(200).json({ message: "All attendance records fetched successfully", attendanceRecords });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch attendance records", error: error.message });
  }
};