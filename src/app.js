const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "EventPulse API" });
});

app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    return next();
  } catch (err) {
    return next(err);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
