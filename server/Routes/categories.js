const express = require('express');
const router = express.Router();

const DEFAULT_CATEGORIES = [
  { name: '📘 Core Subjects' },
  { name: '🧩 Engineering' },
  { name: '🧮 DSA & Coding' },
  { name: '🌐 Web & App Development' },
  { name: '🧑‍🔬 Labs & Assignments' },
  { name: '📚 Previous Papers' },
  { name: '🗂️ Projects' },
  { name: '🎯 Placement' },
  { name: '🎙️ Soft Skills' },
  { name: '📌 Miscellaneous' },
];

// Get all categories (read-only)
router.get('/', (req, res) => {
  res.json(DEFAULT_CATEGORIES);
});

module.exports = router; 