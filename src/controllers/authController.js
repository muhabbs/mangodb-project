const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { createError } = require("../middleware/errorHandler");

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

async function register(req, res, next) {
  try {
    const user = await User.create(req.body);
    const token = signToken(user);
    return res.status(201).json({ success: true, token, user });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      throw createError(401, "Invalid email or password");
    }

    const token = signToken(user);
    return res.status(200).json({ success: true, token, user });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res) {
  return res.status(200).json({ success: true, user: req.user });
}

module.exports = { register, login, me };
