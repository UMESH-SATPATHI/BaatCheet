import toast from "react-hot-toast";

/**
 * Downloads a media file (image, video, document, etc.) using Blob or anchor fallback
 * @param {string} url - The URL or base64 data URI of the file
 * @param {string} fileName - Suggested name for the downloaded file
 */
export const downloadMedia = async (url, fileName = "download") => {
  if (!url) {
    toast.error("No file URL available for download");
    return;
  }

  const toastId = toast.loading(`Downloading ${fileName}...`);

  try {
    // If it's already a data URL or blob URL, download directly
    if (url.startsWith("data:") || url.startsWith("blob:")) {
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!", { id: toastId });
      return;
    }

    // Try fetching as Blob for cross-origin URLs (e.g. Cloudinary)
    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up memory
    setTimeout(() => {
      window.URL.revokeObjectURL(objectUrl);
    }, 1000);

    toast.success("Download started!", { id: toastId });
  } catch (error) {
    console.warn("Direct blob download failed, attempting fallback:", error);

    // Cloudinary specific enhancement: attach fl_attachment flag if possible
    let fallbackUrl = url;
    if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
      fallbackUrl = url.replace("/upload/", "/upload/fl_attachment/");
    }

    // Fallback: Open in new window or trigger browser anchor
    try {
      const link = document.createElement("a");
      link.href = fallbackUrl;
      link.download = fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download initiated!", { id: toastId });
    } catch (fallbackError) {
      console.error("Download fallback failed:", fallbackError);
      window.open(fallbackUrl, "_blank");
      toast.dismiss(toastId);
    }
  }
};

/**
 * Format bytes to human readable format (KB, MB, GB)
 */
export const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

/**
 * Detect media category from filename or mime type
 */
export const getMediaType = (file) => {
  if (!file) return "file";

  const name = typeof file === "string" ? file : file.name || "";
  const type = typeof file === "object" ? file.type || "" : "";
  const ext = name.split(".").pop()?.toLowerCase() || "";

  if (
    type.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "avif"].includes(ext)
  ) {
    return "image";
  }

  if (
    type.startsWith("video/") ||
    ["mp4", "mov", "webm", "avi", "mkv", "m4v"].includes(ext)
  ) {
    return "video";
  }

  if (
    type.startsWith("audio/") ||
    ["mp3", "wav", "ogg", "m4a", "aac"].includes(ext)
  ) {
    return "audio";
  }

  if (["pdf"].includes(ext) || type === "application/pdf") {
    return "pdf";
  }

  if (["doc", "docx", "txt", "rtf", "odt"].includes(ext)) {
    return "doc";
  }

  if (["xls", "xlsx", "csv"].includes(ext)) {
    return "sheet";
  }

  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return "archive";
  }

  return "file";
};
