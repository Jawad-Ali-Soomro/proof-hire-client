import { apiUploadFile } from "./api.js";

export async function uploadDataUrlIfNeeded(dataUrl, baseFilename, token) {
  const u = String(dataUrl || "").trim();
  if (!u || !u.startsWith("data:")) return u;
  const resBlob = await fetch(u);
  const blob = await resBlob.blob();
  if (!blob.type.startsWith("image/")) return "";
  const ext =
    blob.type === "image/png"
      ? "png"
      : blob.type === "image/webp"
        ? "webp"
        : blob.type === "image/gif"
          ? "gif"
          : "jpg";
  const fd = new FormData();
  fd.append("file", blob, `${baseFilename}.${ext}`);
  const uploaded = await apiUploadFile("/profile/upload-image", fd, token);
  return typeof uploaded?.url === "string" ? uploaded.url : "";
}

export async function uploadImageList(urls, baseName, token) {
  const out = [];
  for (let i = 0; i < urls.length; i++) {
    const uploaded = await uploadDataUrlIfNeeded(urls[i], `${baseName}-${i + 1}`, token);
    if (uploaded) out.push(uploaded);
  }
  return out;
}
