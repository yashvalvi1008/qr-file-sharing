import { qs, setStatus } from "./app.js";
import { apiFetch, setToken } from "./authClient.js";

const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const btn = document.getElementById("loginBtn");
const statusEl = document.getElementById("status");

function nextUrl() {
  const next = qs("next");
  return next && next.startsWith("/") ? next : "/index.html";
}

async function login() {
  const email = String(emailEl.value || "").trim();
  const password = String(passwordEl.value || "");

  if (!email || !password) {
    setStatus(statusEl, { kind: "error", text: "Email and password are required." });
    return;
  }

  btn.disabled = true;
  setStatus(statusEl, { text: "Signing in..." });

  try {
    const resp = await apiFetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.message || "Login failed.");
    setToken(data.token);
    location.replace(nextUrl());
  } catch (e) {
    setStatus(statusEl, { kind: "error", text: e?.message || "Something went wrong." });
  } finally {
    btn.disabled = false;
  }
}

btn.addEventListener("click", login);
passwordEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") login();
});

