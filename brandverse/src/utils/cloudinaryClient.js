// frontend
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_BASE = import.meta.env.VITE_API_URL; // e.g. http://localhost:4000/api

// Client helper: ask server for signature, then upload directly to Cloudinary
export async function uploadSigned(file, folder = "brandverse/uploads") {
  if (!file) return null;

  // 1. get signature from backend
  const sigRes = await fetch(`${API_BASE}/uploads/signature?folder=${encodeURIComponent(folder)}`);
  const sigData = await sigRes.json();
  if (!sigData.success && sigData.signature == null) {
    console.error("Failed to get signature", sigData);
    return null;
  }

  const { signature, api_key, timestamp } = sigData;

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", api_key);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", sigData.folder);

  // optional: transformations, tags, public_id, context

  const res = await fetch(url, {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  return data; // contains secure_url, public_id etc.
}
