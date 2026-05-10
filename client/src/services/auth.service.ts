const API_URL = import.meta.env.VITE_API_URL;

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
    roles: string[];
  };
  accessToken: string;
  refreshToken: string;
}

export async function register(
  email: string,
  password: string,
  full_name: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, full_name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function logout(userId: string): Promise<void> {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({userId}),
  });
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}