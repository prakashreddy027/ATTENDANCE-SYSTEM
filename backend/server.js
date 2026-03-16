const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
require("dotenv").config()

const app = express()   // ✅ Create app FIRST

app.use(cors())
app.use(express.json())

// Serve static files from frontend directory (absolute path)
const path = require("path");
app.use(express.static(path.resolve(__dirname, "../frontend")));

// Handle Chrome DevTools probing route gracefully
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).send()
})

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/attendance-system")
  .then(() => {
    console.log("MongoDB Connected")
  })
  .catch((err) => {
    console.log("MongoDB Error:", err)
  })

const userRoutes = require("./routes/userRoutes")
const adminRoutes = require("./routes/adminRoutes")
const authRoutes = require("./routes/authRoutes")

app.use("/api/user", userRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/auth", authRoutes)

app.get('/', (req, res) => {
  res.send('Welcome to the Attendance System API')
})

app.listen(5000, () => {
  console.log("Server running on port 5000")
})