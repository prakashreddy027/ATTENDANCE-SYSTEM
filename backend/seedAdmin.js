const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/user");

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const existingAdmin = await User.findOne({
      email: "mrreddy2727@gmail.com"
    });

    if (existingAdmin) {
      console.log("✅ Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = new User({
      name: "Admin",
      email: "mrreddy2727@gmail.com",
      password: hashedPassword,
      role: "admin"
    });

    await admin.save();

    console.log("✅ Admin created successfully");

    process.exit();

  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();