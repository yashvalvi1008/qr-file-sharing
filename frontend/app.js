export const API_BASE = `${location.origin}/api`;

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

export function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

export function setStatus(el, { kind = "info", text }) {
  el.classList.remove("error", "ok");
  if (kind === "error") el.classList.add("error");
  if (kind === "ok") el.classList.add("ok");
  el.textContent = text;
}

