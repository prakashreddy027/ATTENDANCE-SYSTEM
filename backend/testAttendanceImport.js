const path = require("path");

try {
  const Attendance = require(path.resolve(__dirname, "models/Attendance"));
  console.log("Attendance model imported successfully.");
} catch (error) {
  console.error("Error importing Attendance model:", error);
}