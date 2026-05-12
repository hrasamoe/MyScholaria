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
  role: string = "student",
  schoolName: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, full_name, role, schoolName }),
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
  console.log("Login response", data);
  if (!res.ok) throw new Error(data.message);
  return data;
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem("refreshToken");
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({ refreshToken }),
  });
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export async function forgotpassword(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}
