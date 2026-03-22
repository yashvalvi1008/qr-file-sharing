import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { httpError } from "../utils/httpError.js";

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function signToken({ id, email }) {
  return jwt.sign({ sub: id, email }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export async function registerController(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password ?? "");

    if (!email || !email.includes("@")) throw httpError(400, "InvalidEmail", "Please provide a valid email.");
    if (password.length < 8) throw httpError(400, "WeakPassword", "Password must be at least 8 characters.");

    const existing = await User.findOne({ email }).lean();
    if (existing) throw httpError(409, "EmailInUse", "Email is already registered.");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash });

    const token = signToken({ id: user._id.toString(), email: user.email });
    res.status(201).json({ token, user: { id: user._id.toString(), email: user.email } });
  } catch (e) {
    next(e);
  }
}

export async function loginController(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password ?? "");
    if (!email || !password) throw httpError(400, "InvalidCredentials", "Email and password are required.");

    const user = await User.findOne({ email });
    if (!user) throw httpError(401, "InvalidCredentials", "Invalid email or password.");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw httpError(401, "InvalidCredentials", "Invalid email or password.");

    const token = signToken({ id: user._id.toString(), email: user.email });
    res.json({ token, user: { id: user._id.toString(), email: user.email } });
  } catch (e) {
    next(e);
  }
}

export async function meController(req, res) {
  res.json({ user: req.user });
}

