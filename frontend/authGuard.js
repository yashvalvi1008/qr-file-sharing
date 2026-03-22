import { apiFetch, logout } from "./authClient.js";

async function guard() {
  const resp = await apiFetch("/auth/me");
  if (resp.ok) return;
  logout();
  location.replace(`/login.html?next=${encodeURIComponent(location.pathname + location.search)}`);
}

await guard();

