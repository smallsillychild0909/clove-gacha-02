const API_BASE = import.meta.env.VITE_API_URL ?? "";

/** 圖片網址：完整 http(s) 直接用，否則加上後端前綴（本機 /uploads 用） */
export function imgSrc(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url}`;
}
