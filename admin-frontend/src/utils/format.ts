// Shared formatting and helpers for public pages

export const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("ar-SY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const stripHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

export const isVideo = (url: string | null) =>
  url?.match(/\.(mp4|webm|ogg|mov)$/i);
