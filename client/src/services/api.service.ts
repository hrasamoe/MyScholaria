const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(
  input: string,
  init: RequestInit = {},
  retry = true,
) {
  let res = await fetch(`${API_URL}${input}`, {
    ...init,
    credentials: "include",
  });

  if (res.status === 401 && retry) {
    const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      res = await fetch(`${API_URL}${input}`, {
        ...init,
        credentials: "include",
      });
    }
  }

  return res;
}
