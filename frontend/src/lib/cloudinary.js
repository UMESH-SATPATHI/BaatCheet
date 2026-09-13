const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const getResourceType = (file) => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "auto";
};

export async function uploadMedia(file) {
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary upload settings are missing");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const resourceType = getResourceType(file);
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error?.message || "Media upload failed");
  }

  const data = await response.json();

  return {
    url: data.secure_url,
    resourceType,
  };
}
