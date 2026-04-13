"use strict";

const Subscription = require("../models/Subscription.model");
const User = require("../models/User.model");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSubscriptionConfirmEmail } = require("../utils/email");
const logger = require("../utils/logger");

// ─── List all subscriptions (with optional status filter) ─────────────────────
exports.listSubscriptions = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status && status !== "all") filter.status = status;

  const subscriptions = await Subscription.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: subscriptions.length,
    data: { subscriptions },
  });
});

// ─── Approve a pending subscription ──────────────────────────────────────────
exports.approveSubscription = asyncHandler(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id).populate("user");

  if (!subscription) return next(new AppError("Subscription not found.", 404));
  if (subscription.status !== "pending") {
    return next(new AppError(`Cannot approve a subscription with status: ${subscription.status}`, 400));
  }

  // Activate the subscription
  subscription.status = "active";
  subscription.payments[0].status = "succeeded";
  subscription.payments[0].paidAt = new Date();
  subscription.afripay.confirmedByAdmin = true;
  subscription.afripay.confirmedAt = new Date();
  await subscription.save();

  // Update user record
  await User.findByIdAndUpdate(subscription.user._id, {
    "subscription.plan": subscription.plan,
    "subscription.status": "active",
    "subscription.currentPeriodStart": subscription.currentPeriodStart,
    "subscription.currentPeriodEnd": subscription.currentPeriodEnd,
  });

  // Send confirmation email
  const PLAN_NAMES = { basic: "Basic", premium: "Premium", annual: "Annual Premium" };
  sendSubscriptionConfirmEmail(
    subscription.user,
    PLAN_NAMES[subscription.plan],
    subscription.currentPeriodEnd
  ).catch((err) => logger.warn(`Confirm email failed: ${err.message}`));

  logger.info(`Admin approved subscription: id=${subscription._id} user=${subscription.user.email}`);

  res.status(200).json({
    success: true,
    message: `Subscription approved. ${subscription.user.email} is now subscribed to ${subscription.plan}.`,
    data: { subscription },
  });
});

// ─── Reject a pending subscription ───────────────────────────────────────────
exports.rejectSubscription = asyncHandler(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id).populate("user");

  if (!subscription) return next(new AppError("Subscription not found.", 404));
  if (subscription.status !== "pending") {
    return next(new AppError(`Cannot reject a subscription with status: ${subscription.status}`, 400));
  }

  subscription.status = "failed";
  subscription.payments[0].status = "failed";
  subscription.afripay.rejectedByAdmin = true;
  subscription.afripay.rejectedAt = new Date();
  await subscription.save();

  logger.info(`Admin rejected subscription: id=${subscription._id} user=${subscription.user.email}`);

  res.status(200).json({
    success: true,
    message: `Subscription rejected for ${subscription.user.email}.`,
    data: { subscription },
  });
});