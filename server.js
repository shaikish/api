require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// User Model
const User = mongoose.model("User", new mongoose.Schema({
  username: String,
  email: String,
  password: String,
}));

// Default route to check if API is running
app.get("/", (req, res) => {
  res.send("API is working!");
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Test route is working!" });
});

// Register User
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword });

  try {
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// Login User
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Protected User Profile Route
app.get("/api/user/profile", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ message: `Welcome, ${user.username}!`, user });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
