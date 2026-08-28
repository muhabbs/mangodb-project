const express = require("express");
const { z } = require("zod");

const validate = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const { register, login, me } = require("../controllers/authController");

const router = express.Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(254).toLowerCase(),
    password: z.string().min(8).max(128)
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(254).toLowerCase(),
    password: z.string().min(8).max(128)
  })
});

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, me);

module.exports = router;
