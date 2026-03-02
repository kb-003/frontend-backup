const BASE_URL = ""; // rely on proxy

export async function apiRequest(path: string, options: RequestInit = {}) {
  // Decide which token to use based on current route
  const isAdminApp = window.location.pathname.startsWith("/admin");
  const token = localStorage.getItem(isAdminApp ? "adminToken" : "crewToken");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
