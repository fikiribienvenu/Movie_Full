// src/routes/admin.routes.js
"use strict";

const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth.middleware");
const adminController = require("../controllers/admin.controller");

router.use(protect);
router.use(restrictTo("admin"));

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get("/stats", adminController.getStats);

// ─── Subscriptions ────────────────────────────────────────────────────────────
router.get("/subscriptions", adminController.listSubscriptions);
router.patch("/subscriptions/:id/approve", adminController.approveSubscription);
router.patch("/subscriptions/:id/reject", adminController.rejectSubscription);

// ─── Users ────────────────────────────────────────────────────────────────────
router.get("/users", adminController.listUsers);
router.patch("/users/:id/toggle-active", adminController.toggleUserActive);

// ─── Movies ───────────────────────────────────────────────────────────────────
router.get("/movies", adminController.listMovies);
router.post("/movies", adminController.createMovie);
router.patch("/movies/:id", adminController.updateMovie);
router.delete("/movies/:id", adminController.deleteMovie);

module.exports = router;