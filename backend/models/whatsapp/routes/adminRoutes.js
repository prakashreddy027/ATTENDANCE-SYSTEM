const router = require("express").Router();
const { verifyToken, isAdmin } = require("../../middleware/authmiddleware");
const Attendance = require("../../Attendance");
const User = require("../../user");

// View all employees' attendance
router.get("/attendance", verifyToken, isAdmin, async (req, res) => {
  try {
    const records = await Attendance.find();
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance records" });
  }
});

// Edit attendance
router.put("/attendance/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { loginTime, logoutTime } = req.body;

    const record = await Attendance.findByIdAndUpdate(
      id,
      { loginTime, logoutTime },
      { new: true }
    );

    if (!record) return res.status(404).json({ message: "Record not found" });

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: "Failed to update attendance record" });
  }
});

// Add employee
router.post("/employee", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: "Failed to add employee" });
  }
});

// Remove employee
router.delete("/employee/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Employee removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove employee" });
  }
});

// Search attendance by date or employee
router.get("/attendance/search", verifyToken, isAdmin, async (req, res) => {
  try {
    const { date, employeeId } = req.query;
    const filter = {};

    if (date) filter.date = date;
    if (employeeId) filter.userId = employeeId;

    const records = await Attendance.find(filter).populate("userId", "name email");
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to search attendance records" });
  }
});

module.exports = router;