"use strict";
 
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { restrictTo } = require("../middleware/auth.middleware"); // or however you restrict admin
const adminController = require("../controllers/admin.controller");
 
router.use(protect);
router.use(restrictTo("admin"));
 
// List subscriptions (filter by ?status=pending|active|all)
router.get("/subscriptions", adminController.listSubscriptions);
 
// Approve a pending subscription → activates it
router.patch("/subscriptions/:id/approve", adminController.approveSubscription);
 
// Reject a pending subscription → marks it failed
router.patch("/subscriptions/:id/reject", adminController.rejectSubscription);
 
module.exports = router;