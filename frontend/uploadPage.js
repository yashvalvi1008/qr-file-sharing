import { API_BASE, setStatus } from "./app.js";
import { apiFetch } from "./authClient.js";

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const statusEl = document.getElementById("status");
const qrImg = document.getElementById("qrImg");
const linkBox = document.getElementById("linkBox");
const copyBtn = document.getElementById("copyBtn");
const openBtn = document.getElementById("openBtn");

let lastLink = "";

function setLink(link) {
  lastLink = link || "";
  linkBox.textContent = lastLink;
  copyBtn.disabled = !lastLink;
  openBtn.href = lastLink || "#";
  openBtn.style.pointerEvents = lastLink ? "auto" : "none";
  openBtn.style.opacity = lastLink ? "1" : ".6";
}

copyBtn.addEventListener("click", async () => {
  if (!lastLink) return;
  await navigator.clipboard.writeText(lastLink);
  setStatus(statusEl, { kind: "ok", text: "Link copied to clipboard." });
});

uploadBtn.addEventListener("click", async () => {
  const file = fileInput.files?.[0];
  if (!file) {
    setStatus(statusEl, { kind: "error", text: "Please choose a file first." });
    return;
  }

  uploadBtn.disabled = true;
  setStatus(statusEl, { text: "Uploading to cloud storage..." });
  qrImg.removeAttribute("src");
  setLink("");

  try {
    const form = new FormData();
    form.append("file", file);

    const resp = await apiFetch(`/upload`, {
      method: "POST",
      body: form
    });

    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data?.message || "Upload failed.");
    }

    qrImg.src = data.qrDataUrl;
    setLink(data.downloadPageUrl);
    setStatus(statusEl, {
      kind: "ok",
      text: `Uploaded. Expires at ${new Date(data.expiresAt).toLocaleString()}.`
    });
  } catch (e) {
    setStatus(statusEl, { kind: "error", text: e?.message || "Something went wrong." });
  } finally {
    uploadBtn.disabled = false;
  }
});

