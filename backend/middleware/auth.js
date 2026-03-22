import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { httpError } from "../utils/httpError.js";

function getBearerToken(req) {
  const h = req.headers?.authorization;
  if (!h) return undefined;
  const [kind, token] = String(h).split(" ");
  if (kind?.toLowerCase() !== "bearer" || !token) return undefined;
  return token;
}

export function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) throw httpError(401, "Unauthorized", "Missing auth token.");
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (e) {
    if (e?.name === "TokenExpiredError") return next(httpError(401, "TokenExpired", "Session expired. Please log in again."));
    return next(httpError(401, "Unauthorized", "Invalid auth token."));
  }
}

