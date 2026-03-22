import { API_BASE, formatBytes, qs, setStatus } from "./app.js";

const metaEl = document.getElementById("meta");
const downloadBtn = document.getElementById("downloadBtn");
const copyBtn = document.getElementById("copyBtn");
const dlLinkEl = document.getElementById("dlLink");
const qrImg = document.getElementById("qrImg");
const pageLinkEl = document.getElementById("pageLink");

const id = qs("id");
const pageLink = `${location.origin}/download.html?id=${encodeURIComponent(id || "")}`;
pageLinkEl.textContent = id ? pageLink : "";

let downloadUrl = "";

async function load() {
  if (!id) {
    setStatus(metaEl, { kind: "error", text: "Missing file id." });
    return;
  }

  try {
    const resp = await fetch(`${API_BASE}/file/${encodeURIComponent(id)}`);
    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.message || "Unable to load file.");

    downloadUrl = data.downloadUrl;

    setStatus(metaEl, {
      kind: "ok",
      text:
        `Name: ${data.originalName}\n` +
        `Type: ${data.mimeType}\n` +
        `Size: ${formatBytes(data.size)}\n` +
        `Downloads: ${data.downloads}\n` +
        `Expires: ${new Date(data.expiresAt).toLocaleString()}`
    });

    dlLinkEl.textContent = downloadUrl;
    downloadBtn.disabled = false;
    copyBtn.disabled = false;

    const qrResp = await fetch(`${API_BASE}/qr/${encodeURIComponent(id)}`);
    if (qrResp.ok) {
      const blob = await qrResp.blob();
      qrImg.src = URL.createObjectURL(blob);
    } else {
      qrImg.removeAttribute("src");
    }
  } catch (e) {
    setStatus(metaEl, { kind: "error", text: e?.message || "Something went wrong." });
  }
}

downloadBtn.addEventListener("click", () => {
  if (!downloadUrl) return;
  location.href = downloadUrl;
});

copyBtn.addEventListener("click", async () => {
  if (!downloadUrl) return;
  await navigator.clipboard.writeText(downloadUrl);
  setStatus(metaEl, { kind: "ok", text: "Download link copied." });
});

await load();

