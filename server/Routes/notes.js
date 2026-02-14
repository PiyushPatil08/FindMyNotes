const express = require("express");
const router = express.Router();
const NotesController = require("../Controllers/NotesController");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create
router.post("/upload", upload.fields([{ name: "file", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), NotesController.uploadNote);
// Read all (with filters)
router.get("/getFiles", NotesController.getNotes);
// Read single note by ID
router.get("/:id", NotesController.getNoteByID);
// Download note
router.get("/:id/download", NotesController.downloadNote);
// Update
router.put("/:id", upload.fields([{ name: "file", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), NotesController.updateNote);
// Delete
router.delete("/:id", NotesController.deleteNote);
// Like
router.post("/:id/like", NotesController.likeNote);
// Unlike
router.post("/:id/unlike", NotesController.unlikeNote);

module.exports = router;