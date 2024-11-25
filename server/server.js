const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("./config/db"); // Import database connection

const authRoutes = require("./routes/auth"); // Import authentication routes
const taskRoutes = require("./routes/taskRoutes"); // Import task routes

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON request bodies

// Defines info for the root
app.get("/", (req, res) => {
  res.json({ info: "TaskMaster API" });
});
// Defines authentication routes for registration and login
app.use("/api/auth", authRoutes);
// Defines task routes for CRUD operations on tasks
app.use("/api/tasks", taskRoutes);

// Starting the server on specified port (default is 3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // Log server start message
});
