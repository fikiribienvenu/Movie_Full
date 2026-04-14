// src/controllers/admin.controller.js
"use strict";

const Subscription = require("../models/Subscription.model");
const User = require("../models/User.model");
const Movie = require("../models/Movie.model");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSubscriptionConfirmEmail } = require("../utils/email");
const logger = require("../utils/logger");

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
exports.getStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalMovies,
    activeSubscriptions,
    pendingSubscriptions,
    newUsersToday,
    revenueData,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Movie.countDocuments({ isActive: true }),
    Subscription.countDocuments({ status: "active" }),
    Subscription.countDocuments({ status: "pending" }),
    User.countDocuments({ createdAt: { $gte: today } }),
    Subscription.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: null, total: { $sum: "$price.amount" } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalMovies,
        activeSubscriptions,
        pendingSubscriptions,
        newUsersToday,
        totalRevenue: revenueData[0]?.total ?? 0,
      },
    },
  });
});

// ─── Subscriptions ────────────────────────────────────────────────────────────
exports.listSubscriptions = asyncHandler(async (req, res) => {
  const { status, limit = 50 } = req.query;
  const filter = {};
  if (status && status !== "all") filter.status = status;

  const subscriptions = await Subscription.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    results: subscriptions.length,
    data: { subscriptions },
  });
});

exports.approveSubscription = asyncHandler(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id).populate("user");
  if (!subscription) return next(new AppError("Subscription not found.", 404));
  if (subscription.status !== "pending") {
    return next(new AppError(`Cannot approve a ${subscription.status} subscription.`, 400));
  }

  subscription.status = "active";
  if (subscription.payments[0]) {
    subscription.payments[0].status = "succeeded";
    subscription.payments[0].paidAt = new Date();
  }
  await subscription.save();

  await User.findByIdAndUpdate(subscription.user._id, {
    "subscription.plan": subscription.plan,
    "subscription.status": "active",
    "subscription.currentPeriodStart": subscription.currentPeriodStart,
    "subscription.currentPeriodEnd": subscription.currentPeriodEnd,
  });

  const PLAN_NAMES = { basic: "Basic", premium: "Premium", annual: "Annual Premium" };
  sendSubscriptionConfirmEmail(
    subscription.user,
    PLAN_NAMES[subscription.plan],
    subscription.currentPeriodEnd
  ).catch((err) => logger.warn(`Email failed: ${err.message}`));

  logger.info(`Admin approved subscription: ${subscription._id}`);

  res.status(200).json({
    success: true,
    message: `Subscription approved for ${subscription.user.email}.`,
    data: { subscription },
  });
});

exports.rejectSubscription = asyncHandler(async (req, res, next) => {
  const subscription = await Subscription.findById(req.params.id).populate("user");
  if (!subscription) return next(new AppError("Subscription not found.", 404));
  if (subscription.status !== "pending") {
    return next(new AppError(`Cannot reject a ${subscription.status} subscription.`, 400));
  }

  subscription.status = "failed";
  if (subscription.payments[0]) subscription.payments[0].status = "failed";
  await subscription.save();

  logger.info(`Admin rejected subscription: ${subscription._id}`);

  res.status(200).json({
    success: true,
    message: `Subscription rejected for ${subscription.user.email}.`,
    data: { subscription },
  });
});

// ─── Users ────────────────────────────────────────────────────────────────────
exports.listUsers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter: any = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .select("-password -passwordResetToken -emailVerificationToken")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: users.length,
    data: { users },
  });
});

exports.toggleUserActive = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found.", 404));

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? "enabled" : "disabled"} successfully.`,
    data: { user: { _id: user._id, isActive: user.isActive } },
  });
});

// ─── Movies ───────────────────────────────────────────────────────────────────
exports.listMovies = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter: any = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { director: { $regex: search, $options: "i" } },
    ];
  }

  const movies = await Movie.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: movies.length,
    data: { movies },
  });
});

exports.createMovie = asyncHandler(async (req, res, next) => {
  const movie = await Movie.create(req.body);
  logger.info(`Admin created movie: ${movie.title}`);

  res.status(201).json({
    success: true,
    message: "Movie created successfully.",
    data: { movie },
  });
});

exports.updateMovie = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!movie) return next(new AppError("Movie not found.", 404));

  logger.info(`Admin updated movie: ${movie.title}`);

  res.status(200).json({
    success: true,
    message: "Movie updated successfully.",
    data: { movie },
  });
});

exports.deleteMovie = asyncHandler(async (req, res, next) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) return next(new AppError("Movie not found.", 404));

  logger.info(`Admin deleted movie: ${movie.title}`);

  res.status(200).json({
    success: true,
    message: "Movie deleted successfully.",
  });
});