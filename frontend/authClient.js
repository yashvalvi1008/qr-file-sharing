import { API_BASE } from "./app.js";

const TOKEN_KEY = "qrfshare_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  if (!token) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token);
}

export function logout() {
  setToken("");
}

export async function apiFetch(path, init = {}) {
  const token = getToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const resp = await fetch(`${API_BASE}${path}`, { ...init, headers });
  return resp;
}

