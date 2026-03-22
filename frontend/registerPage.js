import { qs, setStatus } from "./app.js";
import { apiFetch, setToken } from "./authClient.js";

const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const btn = document.getElementById("registerBtn");
const statusEl = document.getElementById("status");

function nextUrl() {
  const next = qs("next");
  return next && next.startsWith("/") ? next : "/index.html";
}

async function register() {
  const email = String(emailEl.value || "").trim();
  const password = String(passwordEl.value || "");

  if (!email || !password) {
    setStatus(statusEl, { kind: "error", text: "Email and password are required." });
    return;
  }

  btn.disabled = true;
  setStatus(statusEl, { text: "Creating account..." });

  try {
    const resp = await apiFetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.message || "Registration failed.");
    setToken(data.token);
    location.replace(nextUrl());
  } catch (e) {
    setStatus(statusEl, { kind: "error", text: e?.message || "Something went wrong." });
  } finally {
    btn.disabled = false;
  }
}

btn.addEventListener("click", register);
passwordEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") register();
});

