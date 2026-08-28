const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { createError } = require("./errorHandler");

async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw createError(401, "Authorization bearer token required");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("_id name email role");

    if (!user) {
      throw createError(401, "Invalid or expired token");
    }

    req.user = user;
    return next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return next(createError(401, "Invalid or expired token"));
    }
    return next(err);
  }
}

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(createError(403, "Insufficient permissions"));
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
