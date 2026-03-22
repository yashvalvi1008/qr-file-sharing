import { logout } from "./authClient.js";

const btn = document.getElementById("logoutBtn");
btn?.addEventListener("click", () => {
  // Let the link navigation happen; we only need to clear local auth state.
  logout();
});

