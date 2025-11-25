const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET; // e.g. ecommerce_upload

export async function uploadUnsigned(file, folder = "brandverse/uploads") {
  if (!file) return null;

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const res = await fetch(url, { method: "POST", body: formData });
  const data = await res.json();
  return data;
}
