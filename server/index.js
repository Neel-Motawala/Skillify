const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const userRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");
const userTestRoutes = require("./routes/userTestRoutes");
const userResponseRoutes = require("./routes/userResponseRoute");
const userResultRoutes = require("./routes/userResultRoute");
const codeRoutes = require("./routes/codeRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Serve static files first
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));  // ✅ serves /public and /public/profile

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/user-test", userTestRoutes);
app.use("/api/user-response", userResponseRoutes);
app.use("/api/results", userResultRoutes);
app.use("/api", codeRoutes);
app.use("/api/admin/users", adminUserRoutes);

app.get("/", (req, res) => {
    res.send("✅ Skill Assessment API is running");
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
